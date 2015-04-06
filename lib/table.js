exports.preprocessTableList = function (tableList){
    /*
     a grid is ["TextContent", "rowspan", "colspan"]
     input: [[["T 1",null,null],["T 2",null,null],["T 3",null,null],["T 4",null,null]],
	    [["2,2","2","2"],["3,2","3","2"]],
	    [],
	    [["colspan=2",null,"2"]],
	    [["A\n(L2)\n(L3)",null,"2"],["K\n(L2)",null,null],["B","2",null]],
	    [["X",null,null],["Y",null,null],["Z",null,null]],[],[],[]];
     final:     [["T 1", "T 2", "T 3", "T 4"],
                 ["2,2", "", "3,2", ""],
                 ["", "", "", ""],
                 ["colspan=2", "", "", ""],
                 ["A\n(L2)\n(L3)", "", "K\n(L2)", "B"],
                 ["X", "Y", "Z", ""]]
     lastFinal: [["T 1", "T 2", "T 3", "T 4"],
                ["2,2", "", "3,2", ""],
                ["", "", "", ""],
                ["colspan=2", "", "", ""],
                ["A", "", "K", "B"],
                ["(L2)", "", "(L2)", ""],
                ["(L3)", "", "", ""],
                ["X", "Y", "Z", ""]]
     */
    // Deal with rowspan and colspan
    var table = tableList;

    // Remove empty arrays at tail
    while(table[table.length - 1].length == 0) {
	table.pop();
    }
    var rowspan, colspan;

    // Get the width of table (the totalamount of fields)
    var tableWidth = table[0].map(function(x){
	rowspan = parseInt(x[2]);
	return rowspan === rowspan ? rowspan : 1;
    }).reduce(function(total, x) { return total + x;}, 0);

    // var "record" save if a position in "final" has been used/processed.
    // initiallize record & final
    var row, col, r, c;
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

    // make "final"
    for (row = 0; row < table.length; row++){
	for (col = 0; col < table[row].length; col++){
	    var item = table[row][col];
	    rowspan = parseInt(item[1]);
	    rowspan = rowspan === rowspan ? rowspan : 1;
	    colspan = parseInt(item[2]);
	    colspan = colspan === colspan ? colspan : 1;
	    c = 0;
	    // c, r is to adjust column begin position
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

    // [0, 0, 0, 0, 2, 0]
    var maxNewlinesAmountAtRow = final.map(
	function(row){
	    return Math.max.apply(
		undefined,
		row.map(
		    function(cellString) {
			// May be null (when nothing matched)
			var matchedNewlines = cellString.match(/\n/g);
			return matchedNewlines ? matchedNewlines.length: 0;
		    })
	    );
	}
    );


    // Deal with newlines......
    var lastFinal = [];
    for (r = 0; r < final.length; r++) {
	if (maxNewlinesAmountAtRow[r] > 0) {

	    // final[r] = ["(L1)\n(L2)", "", "(L1)"]
	    // splitedCell = ["(L1)"] ---> ["(L1)", ""]
	    // cellsList = [["(L1)", "(L2)"], ["", ""], ["(L1)", ""]]
	    var cellsList = final[r].map(
		function(cell){
		    var splitedCell = cell.split("\n");
		    for (var p = splitedCell.length; p < maxNewlinesAmountAtRow[r]; p++){
			splitedCell.push(""); // fill splitedCell with empty string ""
		    }
		    return splitedCell;
		});

	    // Rotate: [["(L1)", "(L2)"], ["", ""], ["(L1)", ""]]
	    //      => [["(L1)", "", "(L1)"], ["(L2)", "", ""]]
	    var rotatedCellList = [];
	    for (i = 0; i < cellsList[0].length; i++) {
		var line=[];
		for (j = 0; j < cellsList.length; j++) {
		    line.push(cellsList[j][i]);
		}
		rotatedCellList.push(line);
	    }
	    lastFinal = lastFinal.concat(rotatedCellList); // Why Array.concat() is not destructive
	} else {
	    lastFinal.push(final[r]);
	}
    }
    return lastFinal;
};

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
};

exports.singleLineTable = function (preprocessedTable){
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
};
