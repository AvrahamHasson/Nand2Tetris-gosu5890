package jack2T

uses java.io.*
uses java.util.*
uses jack2T.Tokenizer

class XMLGenerator {

  construct(myTokenizer: Tokenizer) {
    for (fileName in myTokenizer.getFileTokens().keySet()) {
      myTokenizer.setCurrentFile(fileName)
      var tokens = myTokenizer.getFileTokens().get(fileName)

      try {
        var xmlFileName = fileName.substring(0, fileName.lastIndexOf('.')) + "T.xml"
        var xmlFile = new File(myTokenizer.directoryPath + "/" + xmlFileName)
        var writer = new BufferedWriter(new FileWriter(xmlFile))

        writer.write("<tokens>\n")
        for (token in tokens) {
          myTokenizer.advance()
          var tokenType = determineTokenType(myTokenizer.tokenType())
          writer.write("  <" + tokenType + "> " + escapeXml(myTokenizer.getCurrentToken()) + " </" + tokenType + ">\n")
        }
        writer.write("</tokens>")
        writer.close()
      } catch (e: IOException) {
        e.printStackTrace()
      }
    }
  }

  function determineTokenType(tokenType: Tokenizer.TYPE): String {
    switch (tokenType) {
      case Tokenizer.TYPE.KEYWORD:
        return "keyword"
      case Tokenizer.TYPE.SYMBOL:
        return "symbol"
      case Tokenizer.TYPE.IDENTIFIER:
        return "identifier"
      case Tokenizer.TYPE.INT_CONST:
        return "integerConstant"
      case Tokenizer.TYPE.STRING_CONST:
        return "stringConstant"
      default:
        return "unknown"
    }
  }

  function escapeXml(token: String): String {
    return token.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&apos;")
  }

  static function main() {
    print("Enter the path to the directory containing .jack files: ")
    var scanner = new java.util.Scanner(System.in)
    var directoryPath = scanner.nextLine().trim()

    var tokenizer = new Tokenizer(directoryPath)
    var xmlGenerator = new XMLGenerator(tokenizer)
    print("XML files have been generated.")
  }
}