#!/usr/bin/env node

// 100% ai code


const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;
// For tracking unique states we've already processed/generated
const visitedStates = new Set();

function checkWin(board) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of wins) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes(null)) return 'draw';
    return null;
}

// Canonical filename generator
// Input: board array
// Output: string (e.g. "125", "1x25")
function getFilename(board) {
    // 1. Collect occupied cells: { index: 0-8, player: 'X'|'O' }
    const occupied = [];
    for(let i=0; i<9; i++) {
        if(board[i]) occupied.push({ idx: i + 1, player: board[i] }); // 1-based index
    }
    
    // 2. Sort by index (implicitly done by loop order 0..8)
    
    if (occupied.length === 0) return "index"; // Should not happen for game files.

    let filename = "";
    let expected = 'X'; // We always expect the sequence to follow start-X, alternates.

    for (let i = 0; i < occupied.length; i++) {
        const item = occupied[i];
        
        if (item.player === expected) {
            // Matches expectation (Implicit)
            filename += item.idx;
            // Toggle expectation
            expected = (expected === 'X' ? 'O' : 'X');
        } else {
            // Does not match (Explicit)
            filename += item.player.toLowerCase() + item.idx;
            // After this item, we expect the NEXT one to alternate from THIS item.
            expected = (item.player === 'X' ? 'O' : 'X'); 
        }
    }
    
    return filename;
}

function generateHtml(board, filename) {
    const winner = checkWin(board);
    
    // Determine whose turn it is
    const xCount = board.filter(c => c === 'X').length;
    const oCount = board.filter(c => c === 'O').length;
    const turn = (xCount > oCount) ? 'O' : 'X';
    
    let statusText = "";
    if (winner === 'draw') {
        statusText = "<b>IT'S A DRAW!</b>";
    } else if (winner) {
        statusText = `<b>PLAYER ${winner} WINS!</b>`;
    } else {
        statusText = `<b>PLAYER ${turn} TURN</b>`;
    }

    let tableRows = "";
    for (let r = 0; r < 3; r++) {
        tableRows += "          <tr>\n";
        for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c;
            
            if (board[idx]) {
                tableRows += `           <td align="center" bgcolor="#9BBC0F">${board[idx]}</td>\n`;
            } else if (winner) {
                tableRows += `           <td align="center" bgcolor="#9BBC0F">&nbsp;&nbsp;</td>\n`;
            } else {
                // If we click here, what is the NEXT state?
                const nextBoard = [...board];
                nextBoard[idx] = turn;
                const nextFilename = getFilename(nextBoard);
                
                tableRows += `           <td align="center" bgcolor="#9BBC0F"><button formaction="${nextFilename}.html">&nbsp;&nbsp;</button></td>\n`;
            }
        }
        tableRows += "          </tr>\n";
    }

    const html = `<html lang="en">
<!-- https://www.transparenttextures.com/patterns/stardust.png -->
<body bgcolor="#E0E0E0" text="#333333" link="#8B0000" vlink="#550000" alink="#FF0000">

  <center>

   <br><br>

   
   <!-- Top Navigation (Game Boy Style) -->
   <table width="100%" bgcolor="#999999" cellspacing="0" cellpadding="5" border="0">
    <tr>
     <td align="center">
      <font face="Courier New, Courier, monospace" size="4">
       <b>
       [ <a href="../index.html">START</a> ] &nbsp;&nbsp;
       [ <a href="../blog.html">SELECT</a> ] &nbsp;&nbsp;
       [ <a href="../portfolio.html">ITEMS</a> ] &nbsp;&nbsp;
       [ <a href="../cyber.html">LINK</a> ] &nbsp;&nbsp;
       [ <a href="../nature.html">WORLD</a> ] &nbsp;&nbsp;
       [ <a href="../hotdog.html">FOOD</a> ] &nbsp;&nbsp;
       [ <a href="../cards.html">CARD</a> ]
       </b>
      </font>
     </td>
    </tr>
   </table>
   
   <br><br>

   <!-- Screen Bezel -->
   <table width="600" border="0" cellpadding="20" cellspacing="0" bgcolor="#505050">
    <tr>
     <td align="center" colspan="100">
      
      <!-- Screen Area -->
      <table width="100%" border="0" cellpadding="10" cellspacing="0" bgcolor="#9BBC0F"> <!-- Classic GB Greenish tint or just grey #C0C0C0 -->
       <tr>
        <td align="center">
         
         <font face="Verdana, Geneva, sans-serif" size="6" color="#0F380F"><b>TIC-TAC-TOE</b></font>
         <br>
         <font face="Courier New, Courier, monospace" size="2" color="#306230"><i>ver. 1.0</i></font>
         <br><br>
         
         <!-- Game Board -->
         <form method="GET">
         <table border="4" cellpadding="10" cellspacing="5" bgcolor="#0F380F" bordercolor="#0F380F">
${tableRows}         </table>
         </form>
         
         <br>
         <font face="Courier New, monospace" size="3" color="#0F380F">${statusText}</font>
         
        </td>
       </tr>
      </table>
      
     </td>
    </tr>

    <!-- Bottom Controls Decoration -->
    <tr>
      <td align="center">
        <br>
        <br>
      </td>
    </tr>
   </table>

   <br>
   <br>
   <font face="Arial" size="1" color="#666666">Still 100% static site!</font>

  </center>

 </body>
</html>
`;
    return html;
}

// Recursive generation with state Deduplication
function generateStates() {
    const queue = [];
    const writePromises = [];
    
    // Level 1: 1 move. X at 1..9.
    for(let i=0; i<9; i++) {
        const board = Array(9).fill(null);
        board[i] = 'X';
        const fname = getFilename(board); // Should be "1", "2"... "9"
        queue.push({ board, fname });
    }
    
    // BFS
    while(queue.length > 0) {
        const { board, fname } = queue.shift();
        
        if (visitedStates.has(fname)) continue;
        visitedStates.add(fname);
        
        // Prepare HTML
        const html = generateHtml(board, fname);
        // Queue File Write
        const promise = fs.promises.writeFile(path.join(OUTPUT_DIR, `${fname}.html`), html)
            .catch(err => {
                console.error(`Error writing ${fname}.html:`, err);
                throw err;
            });
        writePromises.push(promise);
        
        // If not terminal, add children
        const winner = checkWin(board);
        if (!winner) {
            // Whom's turn?
            const xCount = board.filter(c => c === 'X').length;
            const oCount = board.filter(c => c === 'O').length;
            const nextPlayer = (xCount > oCount) ? 'O' : 'X';
            
            for(let i=0; i<9; i++) {
                if(!board[i]) {
                    const nextBoard = [...board];
                    nextBoard[i] = nextPlayer;
                    const nextFname = getFilename(nextBoard);
                    
                    if (!visitedStates.has(nextFname)) {
                        queue.push({ board: nextBoard, fname: nextFname });
                    }
                }
            }
        }
    }

    console.log(`Waiting for ${writePromises.length} writes to complete...`);
    return Promise.all(writePromises)
        .then(() => {
            console.log(`Successfully generated ${visitedStates.size} files.`);
        })
        .catch(err => {
            console.error("Failed to complete all file writes.", err);
            process.exit(1);
        })
    ;
}

generateStates();
