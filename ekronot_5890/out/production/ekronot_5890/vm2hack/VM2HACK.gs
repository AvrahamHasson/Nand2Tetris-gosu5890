package vm2hack
uses files.ASMfile
uses files.VMdirec

class VM2HACK {
  construct() {
  }

  public function vm2hack(path:String) : String {
    var myVMdirec = new VMdirec(path)
    var VMcontent = myVMdirec.readFiles()
    var ASMcontent=""
    var labelCountr=0
    var returnAdd=0
    var fileName=""
    if(myVMdirec.vmFiles().size()>1){//if there are more than 1 .vm file -then bootstrap!
      ASMcontent += "@256\n" + "D=A\n" + "@SP\n" + "M=D\n" +
      call_command("call Sys.init 0",returnAdd)
      returnAdd++
    }
    for (var line in VMcontent) {
      if(line.startsWith("//")){
        ASMcontent+=line+"\n"
        fileName=line.substring(2, line.length() - 3)
      }
      else {
        var splitLine = line.split(" ")
        switch (splitLine[0]) //splits the line and check the index 0
        {
          //tar1
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
          //tar2
          case "goto":
            ASMcontent+=goto_command(line,fileName)
            break
          case "if-goto":
            ASMcontent+=if_goto_command(line,fileName)
            break
          case "call":
            ASMcontent+=call_command(line,returnAdd)
            returnAdd++
            break
          case "function":
            ASMcontent+=function_VM_command(line)
            break
          case "return":
            ASMcontent+=return_VM_command(line)
            break
          case "label":
            ASMcontent+=label(line,fileName)
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
    return "// vm command: gt\n" + compH(labelCounter,"JGT")
  }
  private function lt_command(labelCounter:Integer):String {
    return "// vm command: lt\n" + compH(labelCounter,"JLT")
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
  var pushH= "@SP\n" +//A=0
      "A=M\n" +//A=270
      "M=D\n" +//RAM[270]=CONST=5 FOR EXAMPLE
      "@SP\n" +//A=0
      "M=M+1\n"//THE ADDRESS GROW IN 1
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
        var c=""
        if (command[2]=="0") c="THIS"
        else c="THAT"
        VMcontent += "// vm command: push pointer " + command[2] + "\n" +
            "@" + c + "\n" + // A=3
            "D=M\n" // D=RAM[3]
        break
    }
    VMcontent+=pushH
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
        var c=""
        if (command[2]=="0") c="THIS"
        else c="THAT"
        VMcontent +=
            "// vm command: pop pointer"+command[2]+"\n" +
                "@SP\n" +//A=0
                "A=M-1\n" +//A=RAM[0]-1=269
                "D=M\n" +//D=RAM[269] FOR EXAMPLE 3012
                "@"+ c +"\n" +//A=3
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
  //tar2
  private function if_goto_command(line : Object,fileName:String) : String {
    var command = line.toString().split(" ")
    var labelName = command[1]
    return "// vm command: if_goto\n" +
            "@" +
            "SP\n" +//A=0
            "M=M-1\n" +//RAM[0]=RAM[0]-1//SP DECREASE IN 1
            "A=M\n" +//A=RAM[0] FOR EXAMPLE 269
            "D=M\n" +//D=RAM[269]
            "@" +//LOAD LABEL NAME TO A
            fileName +
            "." +
            labelName +
            "\n" +
            "D;JNE\n"//IF THE HEAD OF THE STACK!=0 JUMP TO THE LABEL

  }
  private function goto_command(line : Object, fileName : String) : String {
    var command = line.toString().split(" ")
    var label_name = command[1]//get label c
    return
        "// vm command: goto\n" +
            "@" +
            fileName +
            "." +
            label_name +
            "\n" +
            "0;JMP\n"//JUMP WITOUT CONDITION TO THE LABEL
  }
  private function label(line : Object, fileName : String) : String {
    var command = line.toString().split(" ")
    var label_name = command[1] //get c
    return
        "// vm command: label\n" +
            "(" +
            fileName +
            "." +
            label_name +
            ")\n"

  }
  private function function_VM_command(line : Object) : String {//DECLERATION ON A FUNCTION WITH K LOCAL VARIABLES
    var command = line.toString().split(" ")
    var funcName = command[1]
    var localNum = command[2]
    return "// vm command: function\n" +
            "(" + funcName + ")\n" //DECLARE THE LABEL FOR THE FUNCTION ENTRY
            //WHEN THE FUNC STARTS RUNNING IT NEEDS TO PUT 0 IN THE STACK local_num TIMES
            + "@" + localNum + "\n" +//A=THE NUMBER OF THE LOCALS FOR EXAMPLE 5
            "D=A\n" +//FOR EXAMPLE 5
            "@" + funcName + ".End\n" +
            "D;JEQ\n" +//IF D=0 THEN JUMP TO THE END OF THE FUNCTION
            "(" + funcName + ".Loop)\n" +
            "@SP\n" +             //   A = 0
            "A=M\n" +             //   A = ram[0] FOR EXAMPLE 270
            "M=0\n" +             //   ram[ram[0]] = 0-PUT 0 AT THE HEAD OF STACK AS THE NUM OF LOCALS
            "@SP\n" +             //   A = 0
            "M=M+1\n"+            //   ram[0] = ram[0]+1  +//save space in stack with D val-SP INCREASE IN 1
            "@" + funcName + ".Loop\n" +
            "D=D-1;JNE\n" +//IF D IS STILL NOT=0 REPEAT THE LOOP
            "(" + funcName + ".End)\n"
  }

  private function call_command(line : String, returnAddressIndex:Integer) : String {//AFTER PUSHING N ARGUMENTS -CALL THE FUNC!
    var command = line.toString().split(" ")
    var func_name = command[1]
    var n=command[2]
    //push return-address
    return "// vm command: call\n" +
            "@" +func_name + ".ReturnAddress" + returnAddressIndex + "\n"
            + "D=A\n"
            +pushH

            //push LCL OF CALLER
            + "@LCL\n"//A=1
            + "D=M\n"//D=RAM[1]
            +pushH

            //push ARG
            + "@ARG\n"//A=2
            + "D=M\n"//D=RAM[2]
            +pushH

            //push THIS
            + "@THIS\n"//A=3
            + "D=M\n"//D=RAM[3]
            +pushH

            //push THAT
            + "@THAT\n"//A=4
            + "D=M\n"//D=RAM[4]
            +pushH

            //ARG = SP-n-5=ARGS OF CALLEE
            + "@SP\n"//a=0
            + "D=M\n"//d=ram[0] FOR EXAMPLE 270
            + "@5\n"//a=5
            + "D=D-A\n"//d=ram[0]-5 FOR EXAMPLE 265
            + "@" + n + "\n"//a=n=num of args
            + "D=D-A\n"//d=d-n FOR EXAMPLE 265-N
            + "@ARG\n"//A=2
            + "M=D\n"//RAM[2]=D =THE ADDRESS OF ARGS OF CALLEE

            //LCL OF CALLEE = SP
            + "@SP\n"//A=0
            + "D=M\n"//D=RAM[0] FOR EXAMPLE 270
            + "@LCL\n"//A=1
            + "M=D\n"//RAM[1]=270
            //goto THE func

            +"@"+func_name+"\n"
            +"0;JMP\n"
            //return-address label
            + "(" + func_name + ".ReturnAddress" + returnAddressIndex + ")\n"
  }
  private function return_VM_command(line : String) : String {//RETURN CONTROL TO THE CALLER
     return "// vm command: return\n" +

// FRAME = LCL OF CALLEE
            "@LCL\n"+//A=1
            "D=M\n"+//D=RAM[1]=THE ADDRESS OF LOCALS OF CALLEE

// RET = * (FRAME-5)-PUT THE RETURN ADDRESS IN A TEMPORARY VARIABLE
// RAM[13] = (LOCAL - 5)[13 -15 ARE FREE REGISTERS FOR GENAREAL PURPOSE!]
            //Before placing the returned value - it is mandatory to save the return address.
            //If the function has no arguments - the return address may be overwritten
            "@5\n"+//A=5
            "A=D-A\n"+//A=THE ADDRESS OF LOCALS OF CALLEE-5=THE PLACE OF RETURN ADDRESS
            "D=M\n"+//D=RAM[A]=THE RETURN ADDRESS
            "@13\n"+//A=13
            "M=D\n"+//SAVE THE RETURN ADDRESS IN RAM[13]

// * ARG = pop()=PUT THE RESULT OF CALLEE IN THE PLACE OF ARGUMENT O OF CALLEE-למעלה
            "@SP\n"+//A=0
            "M=M-1\n"+//RAM[0]=RAM[0]-1=SP DECREASE IN 1 FOR EXAMLE 269
            "A=M\n"+//A=269=THE PLACE OF RESULT
            "D=M\n"+//D=RAM[269]=THE RESULT
            "@ARG\n"+//A=2=THE PLACE WHERE THE ADREES OF ARGS OF CALLEE IS WRITTEN
            "A=M\n"+//A=RAM[2]
            "M=D\n"+//RAM[RAM[2]]=THE RESULT
            // SP = ARG+1
            "@ARG\n"+//A=2
            "D=M\n"+//D=RAM[2]
            "@SP\n"+//A=0
            "M=D+1\n"+//RAM[0]=RAM[2]+1 -הדריסה...

// THAT = *(FRAM-1)-RESTORE THAT OF CALLER
            "@LCL\n"+//A=1
            " M=M-1\n"+//RAM[1]=RAM[1]-1
            "A=M\n"+//A=RAM[1]
            "D=M\n"+//D=RAM[RAM[1]]=THE ADRESS OF THAT OF CALLER
            "@THAT\n"+//A=4
            "M=D\n"+//RAM[4]=THE ADREES OF THAT OF CALLER

// THIS = *(FRAM-2)-RESTORE THIS OF CALLER
            "@LCL\n"+//A=1
            "M=M-1\n"+//RAM[1]=RAM[1]-1
            "A=M\n"+//A=RAM[1]
            "D=M\n"+//D=RAM[RAM[1]]=THE ADRESS OF THIS OF CALLER
            "@THIS\n"+//A=3
            "M=D\n"+//RAM[3]=THE ADREES OF THIS OF CALLER
// ARG = *(FRAM-3)-RESTORE ARG OF CALLER
            "@LCL\n"+//A=1
            "M=M-1\n"+//RAM[1]=RAM[1]-1
            "A=M\n"+//A=RAM[1]
            "D=M\n"+
            "@ARG\n"+//A=2
            "M=D\n"+
// LCL = *(FRAM-4)-RESTORE LCL OF CALLER
            "@LCL\n"+
            "M=M-1\n"+
            "A=M\n"+
            "D=M\n"+
            "@LCL\n"+//A=1
            "M=D\n"+

// goto RET
            "@13\n"+//A=13
            "A=M\n"+//A=RAM[13]
            "0; JMP\n"//GO TO RAM[13]

  }

}