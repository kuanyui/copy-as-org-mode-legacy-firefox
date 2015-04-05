var a = [[["Column 1",null,null],["Column 2",null,null],["Column 3",null,null]],
	 [["R2",null,null],["a","2","2"]],
	 [["R3",null,null]],
	 [["R4","2",null],["c",null,null],["d",null,null]],
	 [["C",null,null],["D",null,null]],[],[],[]];

var b = [[["Vertical 3","3",null],["Horizontal 4",null,"4"]],
	 [["I",null,null],["II",null,null],["III",null,null],["IIII",null,null]],
	 [["1",null,null],["2",null,null],["3",null,null],["4",null,null]],[],[],[]];

var c = [[["T 1",null,null],["T 2",null,null],["T 3",null,null],["T 4",null,null]],
	 [["2,2","2","2"],["3,2","3","2"]],
	 [],
	 [["colspan=2",null,"2"]],
	 [["A",null,"2"],["K",null,null],["B","2",null]],
	 [["X",null,null],["Y",null,null],["Z",null,null]],[],[],[]];

function preprocessTableList(tableList){
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
    var record = {};	 // {0:{0:false, 1:false, 2:false}, 1:{...}}
    var final = [];	 // [["", "", ""], ["", "", ""]]
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

preprocessTableList(a);
preprocessTableList(b);
preprocessTableList(c);
