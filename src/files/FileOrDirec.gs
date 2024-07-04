package files
uses java.io.*
abstract class FileOrDirec {
  public var path : String
  public var handle : File

  // A public constructors
  construct() {
    path = null
    handle = null
  }
  construct(_path : String) {
    path = _path
    handle = new File(path) //create a file handle
  }
  public function readFiles() : ArrayList<Object> {
    return null
  }
  public function WriteFiles(content : ArrayList<Object>) : ArrayList<Object> {
    return null
  }
}