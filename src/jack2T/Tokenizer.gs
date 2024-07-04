package jack2T

uses java.io.*
uses java.util.regex.Matcher
uses java.util.regex.Pattern
uses java.util.*
uses files.JackDirec

class Tokenizer {
  static var currentToken:String  = " "
  static var currentTokenType:TYPE  = TYPE.NONE
  static var pointer: int  = 0
  static var fileTokens: Map<String, ArrayList<String>> = new HashMap<String, ArrayList<String>>()
  static var currentFile: String = ""
  public var directoryPath:String =""
  static enum TYPE {
    KEYWORD, SYMBOL, IDENTIFIER, INT_CONST, STRING_CONST, NONE,
  }
  static enum KEYWORD {
    CLASS, METHOD, FUNCTION, CONSTRUCTOR, INT, BOOLEAN, CHAR, VOID, VAR, STATIC,
    FIELD, LET, DO, IF, ELSE, WHILE, RETURN, TRUE, FALSE, NULL, THIS, NONE,
  }

  static var keywordReg = 'class|constructor|function|method|field|static|' +
      'var|int|char|boolean|' +
      'void|true|false|null|this|' +
      'let|do|if|else|while|return'

  static var symbolReg = "[\\&\\*\\+\\(\\)\\.\\/\\,\\-\\]\\;\\~\\}\\|\\{\\>\\=\\[\\<]"
  static var intReg = "[0-9]+"
  static var strReg = "\"[^\"\n]*\""
  static var idReg = "[a-zA-Z_][\\w]*"

  static var tokenPatterns:Pattern = Pattern.compile(symbolReg + "|" + intReg + "|" + strReg + "|" + idReg)

  static var map = {
      "class" -> KEYWORD.CLASS,
      "constructor" -> KEYWORD.CONSTRUCTOR,
      "function" -> KEYWORD.FUNCTION,
      "method" -> KEYWORD.METHOD,
      "field" -> KEYWORD.FIELD,
      "static" -> KEYWORD.STATIC,
      "var" -> KEYWORD.VAR,
      "int" -> KEYWORD.INT,
      "char" -> KEYWORD.CHAR,
      "boolean" -> KEYWORD.BOOLEAN,
      "void" -> KEYWORD.VOID,
      "true" -> KEYWORD.TRUE,
      "false" -> KEYWORD.FALSE,
      "null" -> KEYWORD.NULL,
      "this" -> KEYWORD.THIS,
      "let" -> KEYWORD.LET,
      "do" -> KEYWORD.DO,
      "if" -> KEYWORD.IF,
      "else" -> KEYWORD.ELSE,
      "while" -> KEYWORD.WHILE,
      "return" -> KEYWORD.RETURN
  }

  static var set = {"+", "-", "*", "/", "|", "<", ">", "=", "&"}

  public function Tokenizer(myDirectoryPath: String) {
    directoryPath=myDirectoryPath
    var jackDirec = new JackDirec(directoryPath)
    var jackFiles = jackDirec.jackFiles()

    for (jackFile in jackFiles) {
      try {
        var inFile = new File(directoryPath + "/" + jackFile)
        var scanner = new Scanner(inFile)
        var preprocessed : String = ""
        var line : String = ""
        var tokens = new ArrayList<String>()

        while (scanner.hasNextLine()) {
          line = noComments(scanner.nextLine()).trim()
          if (line.length() > 0) {
            preprocessed += line + "\n"
          }
        }
        preprocessed = noBlockComments(preprocessed).trim()

        var match :Matcher = tokenPatterns.matcher(preprocessed)
        while (match.find()) {
          tokens.add(match.group())
        }

        // Store tokens for the current file
        fileTokens.put(jackFile, tokens)

        // Print the filename and tokens
        print("Filename: " + jackFile)
        print(tokens)

      } catch (e: FileNotFoundException) {
        e.printStackTrace()
      }
    }
  }

  public static function hasMoreTokens():boolean{
    var tokens = fileTokens.get(currentFile)
    return pointer < tokens.size()
  }

  public function advance():TYPE{
    var tokens = fileTokens.get(currentFile)
    if (hasMoreTokens()) {
      currentToken = tokens.get(pointer).toString()
      pointer++
    } else {
      throw new IllegalStateException("No more tokens")
    }

    if (currentToken.matches(keywordReg)){
      currentTokenType = TYPE.KEYWORD
    } else if (currentToken.matches(symbolReg)){
      currentTokenType = TYPE.SYMBOL
    } else if (currentToken.matches(intReg)){
      currentTokenType = TYPE.INT_CONST
    } else if (currentToken.matches(strReg)){
      currentTokenType = TYPE.STRING_CONST
      currentToken = currentToken.substring(1, currentToken.length() - 1)  // Remove the quotation marks
    } else if (currentToken.matches(idReg)){
      currentTokenType = TYPE.IDENTIFIER
    } else {
      throw new IllegalArgumentException("Unknown token: " + currentToken)
    }
    return currentTokenType
  }

  public function getCurrentToken(): String{
    return currentToken
  }

  public function tokenType(): TYPE{
    return currentTokenType
  }

  public function keyWord():KEYWORD{
    if (currentTokenType == TYPE.KEYWORD){
      return map.get(currentToken)
    } else {
      throw new IllegalStateException("Current token is not a keyword!")
    }
  }

  public function symbol_():String{
    if (currentTokenType == TYPE.SYMBOL){
      return currentToken
    } else {
      throw new IllegalStateException("Current token is not a symbol!")
    }
  }

  public static function identifier_():String{
    if (currentTokenType == TYPE.IDENTIFIER){
      return currentToken
    } else {
      throw new IllegalStateException("Current token is not an identifier!")
    }
  }

  public function intVal():int{
    if(currentTokenType == TYPE.INT_CONST){
      return Integer.parseInt(currentToken)
    } else {
      throw new IllegalStateException("Current token is not an integer constant!")
    }
  }

  public function stringVal():String{
    if (currentTokenType == TYPE.STRING_CONST){
      return currentToken
    } else {
      throw new IllegalStateException("Current token is not a string constant!")
    }
  }

  public function pointerBack():int {
    if (pointer > 0) {
      pointer--
      return pointer
    }
    pointer = 0
    return pointer
  }

  public function isOp():Boolean{
    return set.contains(symbol_())
  }

  public static function noComments(strIn :String):String{
    var position:int = strIn.indexOf("//")
    if (position != -1){
      strIn = strIn.substring(0, position)
    }
    return strIn
  }

  public static function noSpaces(strIn:String):String{
    var result :String = ""
    if (strIn.length() != 0){
      var segs = strIn.split(" ")
      for (var s in segs){
        result += s
      }
    }
    return result
  }

  public static function noBlockComments(strIn:String):String{
    var startIndex :int = strIn.indexOf("/*")
    if (startIndex == -1) {return strIn}
    var result = strIn
    var endIndex = strIn.indexOf("*/")
    while(startIndex != -1){
      if (endIndex == -1){
        return strIn.substring(0, startIndex - 1)
      }
      result = result.substring(0, startIndex) + result.substring(endIndex + 2)
      startIndex = result.indexOf("/*")
      endIndex = result.indexOf("*/")
    }
    return result
  }

  // New function to set the current file and reset the pointer
  public function setCurrentFile(fileName: String): void {
    if (fileTokens.containsKey(fileName)) {
      currentFile = fileName
      pointer = 0
    } else {
      throw new IllegalArgumentException("File not found: " + fileName)
    }
  }

  public function getFileTokens(): Map<String, ArrayList<String>> {
    return fileTokens
  }
}

