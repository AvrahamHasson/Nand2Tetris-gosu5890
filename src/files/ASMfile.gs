package files

uses java.io.*
class ASMfile extends FileOrDirec {
  // A public constructor
  construct(_path : String) {
    super(_path)
    if (handle.isDirectory()){
      path=path+"\\"+handle.getName()+".asm"
      handle = new File(path) //create a file handle
    }
  }
  public function WriteFiles(content : String) : String {
    var writer = new FileWriter(path)
    writer.write(content)
    writer.close()
    return content
  }
}