package vm2hack

class VM2HACK {
  construct() {
  }

  public function vm2hack(VMcontent : ArrayList<String>) : String {
    var ASMcontent=""
    var labelCountr=0
    var fileName=""
    for (var line in VMcontent) {
      if(line.startsWith("//")){
        ASMcontent+=line+"\n"
        fileName=line.substring(0, line.length() - 3)
      }
      else {
        var splitLine = line.split(" ")
        switch (splitLine[0]) //splits the line and check the index 0
        {
          case "add":
            ASMcontent+=add_command()
            break
          case "sub":
            ASMcontent+=sub_command()
            break
          case "neg":
            ASMcontent+=neg_command()
            break
          case "eq":
            ASMcontent+=eq_command(labelCountr)
            labelCountr++
            break
          case "gt":
            ASMcontent+=gt_command(labelCountr)
            labelCountr++
            break
          case "lt":
            ASMcontent+=lt_command(labelCountr)
            labelCountr++
            break
          case "and":
            ASMcontent+=and_command()
            break
          case "or":
            ASMcontent+=or_command()
            break
          case "not":
            ASMcontent+=not_command()
            break
          case "push":
            ASMcontent+=push_command(line, fileName)
            break
          case "pop":
            ASMcontent+=pop_command(line, fileName)
            break
          default:
            print("ERROR"+":"+line)
        }
      }

    }

    return ASMcontent
  }
  //Binary
  private function binaryOpH(command : String):String{
    return  "@SP\n"+//A=0
        "A=M-1\n"+//A=269
        "D=M\n"+//D=Y
        "A=A-1\n"+//A=268
        "M=M"+ command + "D\n"+
        "@SP\n"+//A=0
        "M=M-1\n"//RAM[0]=RAM[0]-1=269 FOR EXAMPLE
  }
  private function add_command():String {
    return "// vm command: add\n" + binaryOpH("+")

  }
  private function sub_command():String {
    return "// vm command: sub\n" + binaryOpH("-")
  }
  private function and_command():String {
    return "// vm command: and\n" + binaryOpH("&")
  }
  private function or_command():String {
    return "// vm command: or\n" + binaryOpH("|")
  }
  //Comparison
  private function compH(labelCounter:Integer, command:String):String{
    return "@SP\n"+ //A=0
        "A=M-1\n"+ //A=270-1
        "D=M\n"+ //D=Y
        "A=A-1\n"+ //A=268
        "D=M-D\n"+ //D=X-Y
        "@IF_TRUE" + labelCounter + "\n"+
        "D;"+command+"\n"+
        "@SP\n"+ //A=0
        "M=M-1\n"+ //M= 270-1
        "A=M-1\n"+ //A=268
        "M=0\n"+//RAM[268]=0=FALSE
        "@IF_FALSE" + labelCounter + "\n"+
        "0;JMP\n"+
        "(IF_TRUE" + labelCounter + ")\n"+ //IF X > Y
        "@SP\n"+
        "M=M-1\n"+
        "A=M-1\n"+
        "M=-1\n"+ //THEN PUT -1 AS A TRUE RESULT
        "(IF_FALSE" + labelCounter + ")\n"
  }
  private function eq_command(labelCounter:Integer):String {
    return "// vm command: eq\n" + compH(labelCounter,"JEQ")
  }
  private function gt_command(labelCounter:Integer):String {
    return "// vm command: eq\n" + compH(labelCounter,"JGT")
  }
  private function lt_command(labelCounter:Integer):String {
    return "// vm command: eq\n" + compH(labelCounter,"JLT")
  }
  //Negative
  private function neg_command():String{
    return "// vm command: neg\n" +
        "@SP\n"+//A=0
        "A=M-1\n"+//A=270-1
        "M=-M\n"//M=-Y
  }
  //Not
  private function not_command():String{
    return "// vm command: not\n" +
        "@SP\n" +//A=0
        "A=M-1\n" +//A=270-1
        "M=!M\n"//Y=not Y
  }
  //Stack
  private function pushMemAccH(value : String, mem : String):String{
    return "@" + value + "\n" +//A=X
        "D=A\n" +//D=X
        "@"+mem+"\n"+//A=4
        "A=M+D\n"+//A=RAM[4](4000 FOR EXAMPLE)+X
        "D=M\n"//D=RAM[4000+X]
  }
  private function popMemAccH(value : String, mem : String):String{
    return "@"+mem+"\n"+ //A=4
        "D=M\n"+//D=RAM[4]=4000 FOR EXAMPLE
        "@SP\n"+//A=0
        "A=M\n"+//A=RAM[0]=270
        "M=D\n"+//RAM[270]=4000
        "@" + value + "\n"+//A=X
        "D=A\n"+//D=X
        "@SP\n"+//A=0
        "A=M\n"+//A=RAM[0]=270
        "M=D+M\n"//RAM[270]=RAM[270]+X=4000+X
  }
  private function push_command(line : String, file_name : String): String {
    var VMcontent = ""
    var command = line.split(" ")
    switch (command[1]) {
      case "constant":
        VMcontent +=
            "// vm command: push constant\n" +
                "@" + command[2] + "\n" + //FOR EXAMPLE A=5
                "D=A\n" //D=5
        break

      case "local":
        VMcontent +=
            "// vm command: push local\n" +
                pushMemAccH(command[2], "LCL")
        break
      case "argument":
        VMcontent +=
            "// vm command: push argument\n" +
                pushMemAccH(command[2], "ARG")
        break
      case "this"://FIELDS OF OBJECT
        VMcontent +=
            "// vm command: push this\n" +
                pushMemAccH(command[2], "THIS")
        break
      case "that"://PLACES IN ARRAY
        VMcontent +=
            "// vm command: push that\n" +
                pushMemAccH(command[2], "THAT")
        break
      case "temp":
        VMcontent +=
            "// vm command: push temp\n" +
                "@" + command[2] + "\n" +//A=X and x is between 0 to 7
                "D=A\n" +//D=X
                "@5\n"+//5 is constant value, since temp variables are saved on RAM[5-12]
                "A=A+D\n"+//A=5+X
                "D=M\n"//D=RAM[5+X]
        break
      case "static"://STATIC ARE BETWEEN RAM[16] TO RAM[255]
        VMcontent +=
            "// vm command: push static\n" +
                "@" + file_name + "." + command[2] + "\n" +//A=FILENAME.X-TO GET THE NAME OF THE CLASS =THE NAME OF VM FILE
                "D=M\n" //D=RAM[A]=CONTENT OF STATIC
        break


      case "pointer":
        var l={"THIS","THAT"}
        VMcontent+="// vm command: push pointer" + command[2] + "\n" +
            "@"+l[command[2].toInt()]+"\n" +//A=3
            "D=M\n" //D=RAM[3]
        break
    }
    VMcontent+="@SP\n" +//A=0
        "A=M\n" +//A=270
        "M=D\n" +//RAM[270]=CONST=5 FOR EXAMPLE
        "@SP\n" +//A=0
        "M=M+1\n"//THE ADDRESS GROW IN 1
    return VMcontent
  }
  private function pop_command(line : Object, file_name:String):String {
    var VMcontent=""
    var end= "@SP\n"+//A=0
        "A=M-1\n"+//A=RAM[0]-1=269
        "D=M\n"+//D=RAM[269] FOR EXAMPLE 3
        "@SP\n"+//A=0
        "A=M\n"+//A=RAM[0]=270
        "A=M\n"+//A=RAM[270]=1000+X
        "M=D\n"+//RAM[1000+X]=3
        "@SP\n"+//A=0
        "M=M-1\n"//SP DECREASE IN 1
    var command = line.toString().split(" ")
    switch (command[1].toString()) {
      case "local":
        VMcontent +=
            "// vm command: pop local\n" +
                popMemAccH(command[2], "LCL")+
                end
        break
      case "argument":
        VMcontent +=
            "// vm command: pop argument\n" +
                popMemAccH(command[2], "ARG")+
                end
        break
      case "this":
        VMcontent +=
            "// vm command: pop this\n" +
                popMemAccH(command[2], "THIS")+
                end
        break
      case "that":
        VMcontent +=
            "// vm command: pop that\n" +
                popMemAccH(command[2], "THAT")+
                end
        break
      case "temp":
        VMcontent +=
            "// vm command: pop temp\n" +
                "@5\n"+ //A=5
                "D=A\n"+//D=5
                "@" + command[2] + "\n"+//A=X
                "D=D+A\n"+//D=5+X
                "@SP\n"+//A=0
                "A=M\n"+//A=RAM[0]=270
                "M=D\n"+//RAM[270]=5+X
            end
        break
      case "pointer":
        var l={"THIS","THAT"}
        VMcontent +=
            "// vm command: pop pointer"+command[2]+"\n" +
                "@SP\n" +//A=0
                "A=M-1\n" +//A=RAM[0]-1=269
                "D=M\n" +//D=RAM[269] FOR EXAMPLE 3012
                "@"+l[command[2].toInt()]+"\n" +//A=3
                "M=D\n" +//RAM[3]=RAM[269]=3012
                "@SP\n" +
                "M=M-1\n"
        break
      case "static":
        VMcontent +=
            "// vm command: pop static\n" +
                "@SP\n"+ //A=0
                "A=M-1\n"+//A=RAM[0]-1=269
                "D=M\n"+//D=RAM[269]
                "@" + file_name + "." + command[2] + "\n" +//TO GET THE NAME OF THE CLASS =THE NAME OF VM FILE
                "M=D\n"+//RAM[LABLE]=D
                "@SP\n"+//A=0
                "M=M-1\n"
        break

    }
    return VMcontent
  }
}