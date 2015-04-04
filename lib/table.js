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
    var table = tableList.filter(function(x){ return x.length > 0; }); // Remove empty item
    var finale = table.map(function(row){
	return row.map(function(col){
	    return col.slice(0);
	});
    });

    for (var row = 0; row < table.length; row++){
	for (var col = 0; col < table[row].length; col++){
	    //print("no"); 幹會迴圈
	    var item = table[row][col];
	    if (item[1] || item[2]) { // rowspan or colspan is True
		var rowspan = parseInt(item[1]);
		rowspan = rowspan === rowspan ? rowspan : 1;
		var colspan = parseInt(item[2]);
		colspan = colspan === colspan ? colspan : 1;
		var r, c;
		if (colspan > 1) {
		    for (c = 1; c < colspan; c++){
		    	finale[row].splice(col + c, 0, ["", "C", "C"]); //col
		    }
		    for (r = 1; r < rowspan; r++){
			for (c = 1; c <= colspan; c++){
			    finale[row + r].splice(col + c, 0, ["", "CR", "CR"]);
			}
		    }
		} else if (rowspan > 1) {
		    for (r = 1; r < rowspan; r++){
			finale[row + r].splice(col, 0, ["", "R", "R"]); //row
		    }
		}
	    }
	}
    }
    return finale;
}

preprocessTableList(a);
preprocessTableList(b);
