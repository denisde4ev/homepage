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
        statusText = "<B>IT'S A DRAW!</B>";
    } else if (winner) {
        statusText = `<B>PLAYER ${winner} WINS!</B>`;
    } else {
        statusText = `<B>PLAYER ${turn} TURN</B>`;
    }
 
    let tableRows = "";
    for (let r = 0; r < 3; r++) {
        tableRows += "          <TR>\n";
        for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c;
            
            if (board[idx]) {
                tableRows += `           <TD ALIGN="center" BGCOLOR="#9BBC0F">${board[idx]}</TD>\n`;
            } else if (winner) {
                tableRows += `           <TD ALIGN="center" BGCOLOR="#9BBC0F">&nbsp;&nbsp;</TD>\n`;
            } else {
                // If we click here, what is the NEXT state?
                const nextBoard = [...board];
                nextBoard[idx] = turn;
                const nextFilename = getFilename(nextBoard);
                
                tableRows += `           <TD ALIGN="center" BGCOLOR="#9BBC0F"><BUTTON FORMACTION="${nextFilename}.html">&nbsp;&nbsp;</BUTTON></TD>\n`;
            }
        }
        tableRows += "          </TR>\n";
    }
 
    const html = `<HTML LANG="en">
<!-- https://www.transparenttextures.com/patterns/stardust.png -->
<BODY BGCOLOR="#E0E0E0" TEXT="#333333" LINK="#8B0000" VLINK="#550000" ALINK="#FF0000">
 
  <CENTER>
 
    <BR><BR>
 
    
    <!-- Top Navigation (Game Boy Style) -->
    <TABLE WIDTH="100%" BGCOLOR="#999999" CELLSPACING="0" CELLPADDING="5" BORDER="0">
     <TR>
      <TD ALIGN="center">
       <FONT FACE="Courier New, Courier, monospace" SIZE="4">
        <B>
        [ <A HREF="../index.html">START</A> ] &nbsp;&nbsp;
        [ <A HREF="../blog.html">SELECT</A> ] &nbsp;&nbsp;
        [ <A HREF="../portfolio.html">ITEMS</A> ] &nbsp;&nbsp;
        [ <A HREF="../cyber.html">LINK</A> ] &nbsp;&nbsp;
        [ <A HREF="../nature.html">WORLD</A> ] &nbsp;&nbsp;
        [ <A HREF="../hotdog.html">FOOD</A> ] &nbsp;&nbsp;
        [ <A HREF="../cards.html">CARD</A> ]
        </B>
       </FONT>
      </TD>
     </TR>
    </TABLE>
    
    <BR><BR>
 
    <!-- Screen Bezel -->
    <TABLE WIDTH="600" BORDER="0" CELLPADDING="20" CELLSPACING="0" BGCOLOR="#505050">
     <TR>
      <TD ALIGN="center" COLSPAN="100">
       
       <!-- Screen Area -->
       <TABLE WIDTH="100%" BORDER="0" CELLPADDING="10" CELLSPACING="0" BGCOLOR="#9BBC0F"> <!-- Classic GB Greenish tint or just grey #C0C0C0 -->
        <TR>
         <TD ALIGN="center">
          
          <FONT FACE="Verdana, Geneva, sans-serif" SIZE="6" COLOR="#0F380F"><B>TIC-TAC-TOE</B></FONT>
          <BR>
          <FONT FACE="Courier New, Courier, monospace" SIZE="2" COLOR="#306230"><I>ver. 1.0</I></FONT>
          <BR><BR>
          
          <!-- Game Board -->
          <FORM METHOD="GET">
          <TABLE BORDER="4" CELLPADDING="10" CELLSPACING="5" BGCOLOR="#0F380F" BORDERCOLOR="#0F380F">
 ${tableRows}         </TABLE>
          </FORM>
          
          <BR>
          <FONT FACE="Courier New, monospace" SIZE="3" COLOR="#0F380F">${statusText}</FONT>
          
         </TD>
        </TR>
       </TABLE>
       
      </TD>
     </TR>
 
     <!-- Bottom Controls Decoration -->
     <TR>
       <TD ALIGN="center">
         <BR>
         <BR>
       </TD>
     </TR>
    </TABLE>
 
    <BR>
    <BR>
    <FONT FACE="Arial" SIZE="1" COLOR="#666666">Still 100% static site!</FONT>
 
  </CENTER>
 
 </BODY>
</HTML>
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
