package jack2T
uses jack2T.CompilationEngine
uses jack2T.Tokenizer

uses java.io.*

//Avraham Hasson 328075890


main()
public static function main() : void {
  var scanner = new Scanner(System.in)
  var path_ = scanner.nextLine()
  var tokenizer = new Tokenizer(path_)
  var compilationEngine: CompilationEngine = new CompilationEngine(tokenizer)
  //everything starts with class in jack
  compilationEngine.compileClass()
  // var t: JackTokenizer =new JackTokenizer(currentJackFile)
}