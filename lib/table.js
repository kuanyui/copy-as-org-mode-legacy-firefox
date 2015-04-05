function preprocessTableList(tableList){
    /*
     a grid is ["TextContent", "rowspan", "colspan"]
     input: [[["T 1",null,null],["T 2",null,null],["T 3",null,null],["T 4",null,null]],
	    [["2,2","2","2"],["3,2","3","2"]],
	    [],
	    [["colspan=2",null,"2"]],
	    [["A",null,"2"],["K",null,null],["B","2",null]],
	    [["X",null,null],["Y",null,null],["Z",null,null]],[],[],[]];
    output: [["T 1", "T 2", "T 3", "T 4"],
             ["2,2", "", "3,2", ""],
             ["", "", "", ""],
             ["colspan=2", "", "", ""],
             ["A", "", "K", "B"],
             ["X", "Y", "Z", ""]]

     */
    // Deal with rowspan and colspan
    var table = tableList;
    // Remove empty arrays at tail
    while(table[table.length - 1].length == 0) {
	table.pop();
    }
    var rowspan, colspan;

    var tableWidth = table[0].map(function(x){
	rowspan = parseInt(x[2]);
	return rowspan === rowspan ? rowspan : 1;
    }).reduce(function(total, x) { return total + x;}, 0);

    // var "record" save if a position in "final" has been used/processed.
    var record = {};	 // init: {0:{0:false, 1:false, 2:false}, 1:{...}}
    var final = [];	 // init: [["", "", ""], ["", "", ""]]
    var i, j;
    for (i = 0; i < table.length; i++) {
	record[i] = {};
	final[i] = [];
	for (j = 0; j < tableWidth; j++) {
	    record[i][j] = false; // haven't be used.
	    final[i][j] = "--";
	}
    }

    for (var row = 0; row < table.length; row++){
	for (var col = 0; col < table[row].length; col++){
	    var item = table[row][col];
	    rowspan = parseInt(item[1]);
	    rowspan = rowspan === rowspan ? rowspan : 1;
	    colspan = parseInt(item[2]);
	    colspan = colspan === colspan ? colspan : 1;
	    var c = 0;	// adjust column begin position
	    while (record[row][col + c]) { c++; };

	    // rowspan & colspan
	    if (final[row][col + c] != undefined ) { // if NOT out of array
		for (var R = 0; R < rowspan; R++) {
		    for (var C = 0; C < colspan; C++) {
			if (R == 0 && C == 0) {
			    final[row][col + c] = item[0];
			} else {
			    final[row + R][col + c + C] = "";
			}
			record[row + R][col + c + C] = true;
		    }
		}
	    }
	}
    }
    return final;
}

function getStringWidth(str){
    /* Get string's "real" width.
     http://www.rikai.com/library/kanjitables/kanji_codes.unicode.shtml
     CJK characters will be replaced with "xx", and be counted as 2-width character.
     */
    var string = str;
    return string.replace(/[\u4e00-\u9faf\u3000-\u30ff\uff00-\uff60\uffe0-\uffe6]/g, "xx").length;
};

function fillWithSpaces(str, toWidth){
    // Fill string with spaces to a specific width.
    var stringWidth = getStringWidth(str);
    return str + Array((toWidth - stringWidth) + 1).join(" ");
}

function singleLineTable(preprocessedTable){
    var table = preprocessedTable;
    var rowAmount = table.length;
    var colAmount = table[0].length;
    var fieldWidths = [];
    var row, col;
    // Get all columns' (fields') widths as a list "fieldWidths".
    for (col = 0; col < colAmount; col++) {
	var _lens = table.map(function(r){return getStringWidth(r[col]);});
	fieldWidths.push(Math.max.apply(null, _lens));
    }
    // Use fillWithSpaces()
    for (row = 0; row < rowAmount; row++) {
    	for (col = 0; col < colAmount; col++) {
    	    table[row][col] = fillWithSpaces(table[row][col], fieldWidths[col]);
    	}
    }
    // Format
    var splitLine = fieldWidths.map(function(w){return Array(w + 1).join('-');}).join("-+-");
    splitLine = "|-" + splitLine + "-|\n";

    var finale = "";
    finale += "| " + table[0].join(" | ") + " |\n";
    finale += splitLine;
    for (row = 1; row < rowAmount; row++) {
	finale += "| " + table[row].join(" | ") + " |\n";
    }
    return finale;
}
