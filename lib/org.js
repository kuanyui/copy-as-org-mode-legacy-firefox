var Table = require("table");

function chomp(string) {
  // string chomp!
  return string.replace(/^\s+/, '').replace(/\s+$/, '');
}

function removeNewlines(string) {
  // remove any new-line chars
  return string.replace("\n", '');
}

function determineTitle(title) {
  title = removeNewlines(chomp(title));

  if (title === '') {
      title = "(No Title)";
  }

    return title.replace(/\[/, '').replace(/\[/, ' - ');
}

exports.formatLink = function(url, title) {
  return "[[" + url + "][" + determineTitle(title) + "]]";
};

exports.formatImage = function(url, title) {
  return "[[" + url + "]]";
};

exports.formatList = function(texts) {
  // new line chars are appended at the end of each line
  // to make sure that we'll have a new line char at the very end.
  return texts.map(function(text) {
    return "- " + text + "\n";
  }).join("");
};

exports.formatSingleLineTable = function(tableList) {
    return Table.singleLineTable(Table.preprocessTableList(tableList));
}
