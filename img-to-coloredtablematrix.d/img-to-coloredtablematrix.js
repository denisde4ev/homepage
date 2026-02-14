#!/usr/bin/env node


// generic shell-line var helpers:

var [nadepath, $0, ...args] = process.argv;
var [$1, $2, $3] = args;

if ($1 === '--debug' || $1 === '--inspect' || $1 === '--inspect-brk') {
	args.shift();
	_=require('child_process').spawnSync(
		nadepath, ['--inspect'+($1.endsWith('-brk')?'-brk':''), $0 , ...args],
		{stdio:"inherit"}).status;
	throw process.exit(_);
}

var 
	stdout  = str => process.stdout.write(str +'\n'),
	stderr  = str => process.stderr.write(str +'\n'),
	noop    = ()  => void 0,
	//freezer = o   => Object.freeze(Object.seal(o)), // hope to het somoptimosations¿ in loops. by adding this
_=0;


//

if ($1 === '--help') {
	stdout(
		`Usage: ${$0.replace(/^.*\//,'')} <image file> <output file.html>\n`+
		`\nConverts an image to an HTML table where each cell represents a pixel color.\n`+
		`This implementation uses the 'convert' command (ImageMagick) to parse the image.`
	);
	throw process.exit(0);
}

if (args.length === 0) {
	stdout('see --help for usage');
	throw process.exit(2);
} else if (args.length === 1) {
	stderr('Error: Output file argument expected.');
	throw process.exit(2);
} else if (args.length === 2) {
	// all ok
} else {
	stderr(`Error: too many arguments,\nsee --help for usage`)
	throw process.exit(2);
}

var inputfile = $1;
var outputfile = $2;


var fs = require('fs');
var { spawn } = require('child_process');

if (!fs.existsSync(inputfile)) {
	stderr(`Error: Input file '${inputfile}' not found.`);
	throw process.exit(1);
}

// Start convert process
// Output format: PPM (P3) which is ASCII text: "P3\nWidth Height\nMaxVal\nR G B R G B..."
var convert = spawn('convert', [inputfile, '-compress', 'none', '-depth', '8', 'ppm:-']);

var out = fs.createWriteStream(outputfile);

// Write HTML Table Start
out.write(`<table>
`);

const toHex = n => n.toString(16).padStart(2, '0');


var buffer = '';
var state = 0; // 0=Magic, 1=Dims, 2=MaxVal, 3=Body
var width = 0, height = 0, maxVal = 255;
var values = [];
var col = 0, row = 0;

convert.stdout.on('data', chunk => {
	buffer += chunk.toString();
	processBuffer();
});

convert.stderr.on('data', data => {
	// stderr(`convert msg: ${data}`); 
	// convert can correspond warnings on stderr
});

convert.on('close', code => {
	if (code !== 0) {
		stderr(`convert process exited with code ${code}`);
		// try to close cleanly anyway
	}
	out.write('</table>\n');
	out.end();
});

convert.on('error', err => {
	stderr(`Failed to start 'convert': ${err.message}`);
	stderr('Make sure ImageMagick is installed and in your PATH.');
	process.exit(1);
});

function processBuffer() {
	// Check if buffer ends in whitespace (safe to split)
	// If not, we hold the last token back
	var safeEnd = /\s$/.test(buffer);
	var parts = buffer.split(/\s+/);
	
	// If we aren't sure the last token is complete, save it for next time
	buffer = safeEnd ? '' : parts.pop();

	for (var i = 0; i < parts.length; i++) {
		var token = parts[i];
		if (!token) continue; // skip empty tokens from multiple spaces

		// Handle Comments (PPM allows # to end of line)
		// But here we split by whitespace, so comments might be fragmented into tokens
		// This split logic assumes clean data. 
		// `convert -compress none` output is generally clean.
		// If we encounter '#', we should skip until newline? 
		// Our split destroyed newlines. This is a weakness of simple whitespace splitting.
		// However, standard convert ppm output does not usually include comments in the data stream.
		// We will proceed assuming standard convert output.

		if (state === 0) { // P3 Magic
			if (token === 'P3') {
				state = 1;
			} else {
				// verify it's not a comment or garbage?
				// Just ignore or error?
				// Error is safer
				// stderr(`Invalid PPM header: ${token}`);
				// process.exit(1);
			}
		} else if (state === 1) { // Dimensions
			values.push(token);
			if (values.length === 2) {
				width = parseInt(values[0]);
				height = parseInt(values[1]);
				values = [];
				state = 2;
			}
		} else if (state === 2) { // MaxVal
			maxVal = parseInt(token);
			state = 3;
			out.write('<tr>'); // Start first row
			col = 0;
			row = 0;
		} else if (state === 3) { // Body RGB
			values.push(token);
			if (values.length === 3) {
				var r = values[0];
				var g = values[1];
				var b = values[2];
				
				var hex = `#${toHex(Number(r))}${toHex(Number(g))}${toHex(Number(b))}`;
				out.write(`<td bgcolor="${hex}"></td>`);
				values = [];
				
				col++;
				if (col >= width) {
					out.write('</tr>');
					row++;
					if (row < height) {
						out.write('\n<tr>');
					}
					col = 0;
				}
			}
		}
	}
}
