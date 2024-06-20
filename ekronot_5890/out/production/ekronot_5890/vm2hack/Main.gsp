uses files.ASMfile
uses files.VMdirec
//main()
//get the path from the user
var scanner = new Scanner(System.in)
var path = scanner.nextLine()
//vm file
var myVMdirec = new VMdirec(path)
var VMcontent = myVMdirec.readFiles()
//vm2hack
var myVM2HACK = new vm2hack.VM2HACK()
var ASMcontent = myVM2HACK.vm2hack(VMcontent)
//asm file
var myAsmfile = new ASMfile(path)
print(myAsmfile.WriteFiles(ASMcontent))

