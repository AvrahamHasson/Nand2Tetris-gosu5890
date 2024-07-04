package files
uses files.FileOrDirec

uses java.io.*

class JackDirec extends FileOrDirec {

  construct(_path : String) {
    super(_path)
  }

  public function jackFiles():ArrayList<String>{
    var jackFiles = new ArrayList<String>()
    for (fname in handle.list())
      if(fname.endsWith(".jack"))
        jackFiles.add(fname.toString())
    return jackFiles
  }
}