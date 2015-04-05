var SDK = {
  Clipboard: require("sdk/clipboard")
};

var Org = require("org");

var copyToClipboard = function(string) {
  SDK.Clipboard.set(string, "text");
};

exports.link = function(url, title) {
  title = title || url;

  var string = Org.formatLink(url, title);

  copyToClipboard(string);
};

exports.image = function(url, title) {
  title = title || url;

  var string = Org.formatImage(url, title);

  copyToClipboard(string);
}

exports.tab = function(tab) {
  this.link(tab.url, tab.title);
};

exports.tabs = function(tabs) {
  var formattedTabs = new Array(tabs.length);

  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];
    formattedTabs[i] = Org.formatLink(tab.url, tab.title);
  }

  var string = Org.formatList(formattedTabs);

  copyToClipboard(string);
};

exports.singleLineTable = function(table) {
    var string = Org.formatSingleLineTable(table);

    copyToClipboard(string);
};
