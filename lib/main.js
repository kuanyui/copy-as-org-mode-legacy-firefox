var SDK = {
  UI: {
    Button: {
      Toggle: require('sdk/ui/button/toggle')
    }
  },
  Tabs: require("sdk/tabs"),
  Windows: require("sdk/windows"),
  Panels: require("sdk/panel"),
  Self: require("sdk/self"),
  ContextMenu: require("sdk/context-menu")
};

var CopyAsOrg = require("copy-as-org");

var togglePanel = function(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
};

// bootstrap
var button = SDK.UI.Button.Toggle.ToggleButton({
  id: "copy-as-org",
  label: "Copy as Org",
  icon: {
    "16": "./images/icon-16.png",
    "32": "./images/icon-32.png",
    "64": "./images/icon-64.png"
  },
  onChange: togglePanel
});

var handleHide = function() {
  button.state('window', { checked: false });
};

var panel = SDK.Panels.Panel({
  contentURL: SDK.Self.data.url("panel.html"),
  contentStyleFile: SDK.Self.data.url("panel.css"),
  contentScriptFile: SDK.Self.data.url("panel.js"),
  onHide: handleHide,
  width: 100,
  height: 56
});

panel.port.on("copy", function(scope) {
  var currentWindow = SDK.Windows.browserWindows.activeWindow;

  switch (scope) {
    case "current-tab":
      CopyAsOrg.tab(currentWindow.tabs.activeTab);
      break;

    case "all-tabs":
      CopyAsOrg.tabs(currentWindow.tabs);
      break;
  }
});

panel.port.on("close", function() {
  panel.hide();
});

var anyContext = SDK.ContextMenu.PredicateContext(function() {
  return true;
});

var contextMenu = SDK.ContextMenu.Menu({
  label: "Copy as Org",
  context: anyContext,
  image: SDK.Self.data.url("images/icon-16.png")
});

// context menu for a link
var copyLinkAsOrgMenuItem = SDK.ContextMenu.Item({
  label: "[[URL][Link Title]]",
  data: "copyLinkAsOrg",
  parentMenu: contextMenu,
  context: SDK.ContextMenu.SelectorContext("a"),
  // TODO: use contentScriptFile
  contentScript:  'self.on("click", function(node, data) {' +
                  '  self.postMessage({ url: node.href, title: node.textContent });' +
                  '});',
  onMessage: function(message) {
    CopyAsOrg.link(message.url, message.title);
  }
});

var copyImageAsOrg = SDK.ContextMenu.Item({
  label: "[[Image URL]]",
  data: "copyImageAsOrg",
  parentMenu: contextMenu,
  context: SDK.ContextMenu.SelectorContext("img"),
  // TODO: use contentScriptFile
  contentScript:  'self.on("click", function(node, data) {' +
                  '  self.postMessage({ url: node.src, title: node.alt });' +
                  '});',
  onMessage: function(message) {
    CopyAsOrg.image(message.url, message.title);
  }
});

var copySingleLineTableAsOrgMenuItem = SDK.ContextMenu.Item({
    label: "| Single Line | Table |",
    data: "copySingleLineTableAsOrg",
    parentMenu: contextMenu,
    context: SDK.ContextMenu.SelectorContext("table"),
    contentScript: 'self.on("click", function(node, data) {' +
'    var table = [];' +
'    for (var i in node.rows) {' +
'	var tr = node.rows[i];' +
'	var row = [];' +
'	for (var j in tr.cells) {' +
'	    var td = tr.cells[j];' +
'	    var attr = td.attributes;' +
'	    if (attr) {' +
'		var rowspan = attr.getNamedItem("rowspan");' +
'		rowspan = rowspan ? rowspan.value : undefined;' +
'		var colspan = attr.getNamedItem("colspan");' +
'		colspan = colspan ? colspan.value : undefined;' +
'		row.push([td.textContent, rowspan, colspan]);' +
'	    }' +
'	}' +
'	table.push(row);' +
'    }' +
'    self.postMessage({ table: table });' +
'});' ,
    onMessage: function(message) {
	CopyAsOrg.singleLineTable(message.table);
    }
});

// context menu actions for page itself
var copyCurrentPageAsOrgMenuItem = SDK.ContextMenu.Item({
  label: "[[URL][Page Title]]",
  data: "copyCurrentPageAsOrg",
  parentMenu: contextMenu,
  context: anyContext,
  // TODO: use contentScriptFile
  contentScript:  'self.on("click", function(node, data) {' +
                  '  self.postMessage({ url: window.location.href, title: document.title });' +
                  '});',
  onMessage: function(message) {
    CopyAsOrg.link(message.url, message.title);
  }
});




exports.main = function (options, callbacks) {
  if (options.loadReason === 'startup') {
      SDK.Tabs.open('https://jsfiddle.net/L18ytgLb/6/');
  }
};
