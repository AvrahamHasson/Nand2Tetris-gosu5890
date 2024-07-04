uses files.ASMfile
uses files.VMdirec
//Avraham Hasson 328075890
//main()
//get the path from the user
var scanner = new Scanner(System.in)
var path = scanner.nextLine()
//vm2hack
var myVM2HACK = new vm2hack.VM2HACK()
var ASMcontent = myVM2HACK.vm2hack(path)
//asm file
var myAsmfile = new ASMfile(path)
print(myAsmfile.WriteFiles(ASMcontent))
