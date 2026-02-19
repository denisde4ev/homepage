#!/usr/bin/env node

// generic shell-line var helpers:
var [nadepath, $0, ...args] = process.argv;
var [$1, $2, $3, $4] = args;


var stdout  = str => process.stdout.write(str);
var stderr  = str => process.stderr.write(str);
//var noop    = ()  => void 0;

if ($1 === '--help') {
	stdout(
		`Usage: ${$0} <output file.html> [width] [height] [density]\n`+

		`\n`+
		`Generates an HTML star field SVG using unicode characters and legacy attributes.\n`+
		`Default: width=80, height=24, density=5 (prosentage)\n`+
		`(width and height are in characters, not pixels)\n`+
	``);


	throw process.exit(0);
}



if (!args.length) {
	stdout('see --help for usage\n');
	throw process.exit(2);
}

var outputfile =  $1;
var width      = $2 ?? 80; // expected int
var height     = $3 ?? 24; // expected int
var density    = $4 ?? 5; // expected float

if (4	< args.length) {
	stderr('Error: too many arguments\n');
	throw process.exit(2);
}


var fs = require('fs');
var out = fs.createWriteStream(outputfile);



// when font-size:16px
var charW = 10;
var charH = 22;

var svgW = width * charW;
var svgH = height * charH;





// Write SVG Start with foreignObject

// viewBox="0 0 ${svgW/scale} ${svgH/scale}"
// for debug: <rect x="0" y="0" width="100%" height="100%" fill="green" />

/*
12345|
2
3
4
5
6
7
8
9
0
AA
BBB
CCCC
DDDDD

*/

out.write(`<SVG
WIDTH="100%" HEIGHT="2000"
XMLNS="http://www.w3.org/2000/svg"><FOREIGNOBJECT WIDTH="100%" HEIGHT="100%" FONT-SIZE="0">
<PRE XMLNS="http://www.w3.org/1999/xhtml"><FONT COLOR="gray" SIZE="3"><CENTER>`);



//var stars = ['*', '.', '·', '✧', '✦', '°', '·'];
var stars = ['*', '.', '·', '·', '✧', '✦', '°', '·', '+'];
function getStar() {
	// Weighted selection for more varied "noise"
	return stars[Math.floor(Math.random() * stars.length)];
}

for (var y = 0; y < height; y++) {
	var row = '';
	for (var x = 0; x < width; x++) {
		if (Math.random() < density/100) {
			row += getStar();
		} else {
			row += ' ';
		}
	}
	out.write(row + '\n');
}



out.write(`</CENTER></FONT></PRE></FOREIGNOBJECT></SVG>`);


out.end(() => {
	stderr(`Generated star field SVG at ${outputfile}\n`);
});
