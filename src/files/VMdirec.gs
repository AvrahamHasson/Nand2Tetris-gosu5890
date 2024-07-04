package files
uses files.FileOrDirec

uses java.io.*

class VMdirec extends FileOrDirec {

  construct(_path : String) {
    super(_path)
  }

  public function readFiles() : ArrayList<String> {
    var vm_content = new ArrayList<String>()
    for (var fname in handle.list()) {
      if (fname.endsWith(".vm")) {
        vm_content.add("//" + fname)
        var currentFile = new File(path + "\\" + fname)
        var reader = new Scanner(currentFile) // create object to read from file
        while (reader.hasNextLine()) { // while its not the EOF read all the content from the file and add it to the array
          var line = reader.nextLine().toString()
          if (!line.startsWith("//") && !line.isEmpty()) {
            vm_content.add(line.toString())
          }
        }
        reader.close() // close the Scanner to release resources
      }
    }
    return vm_content
  }

  public function vmFiles():ArrayList<String>{
    var vmFiles = new ArrayList<String>()
    for (fname in handle.list())
      if(fname.endsWith(".vm"))
        vmFiles.add(fname.toString())
    return vmFiles
  }

}
