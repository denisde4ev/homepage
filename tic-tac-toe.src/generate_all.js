
// AI
const fs = require('fs');
const path = require('path');

const START_MOVES = "573";
const OUTPUT_DIR = __dirname;

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

function generate(moves) {
    const board = Array(9).fill(null);
    for (let i = 0; i < moves.length; i++) {
        const pos = parseInt(moves[i]) - 1;
        board[pos] = i % 2 === 0 ? 'X' : 'O';
    }

    const winner = checkWin(board);
    const turn = moves.length % 2 === 0 ? 'X' : 'O';

    let actionsLog = "";
    for (let i = 0; i < moves.length; i++) {
        actionsLog += `${i % 2 === 0 ? 'X' : 'O'}: ${moves[i]}\n`;
    }

    // Add extra newlines for spacing in pre tag
    const logLines = moves.length;
    for (let i = logLines; i < 11; i++) {
        actionsLog += "\n";
    }

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
            const posChar = (idx + 1).toString();
            if (board[idx]) {
                tableRows += `           <td align="center" bgcolor="#9BBC0F">${board[idx]}</td>\n`;
            } else if (winner) {
                tableRows += `           <td align="center" bgcolor="#9BBC0F">&nbsp;&nbsp;</td>\n`;
            } else {
                tableRows += `           <td align="center" bgcolor="#9BBC0F"><button formaction="${moves}${posChar}.html">&nbsp;&nbsp;</button></td>\n`;
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
      <td></td>
      <td align="left">
        <font color="#999999">
<pre>
<font size="4"><b><i>Actions log:</i></b></font>
${actionsLog}</pre>
          <br>
        </font>
      </td>
      <td></td>
      <td></td>
    </tr>
   </table>

   <br>
   <br>
   <font face="Arial" size="1" color="#666666">
    Still 100% static site!
   </font>

  </center>

 </body>
</html>
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `${moves}.html`), html);

    if (!winner) {
        for (let i = 1; i <= 9; i++) {
            if (!moves.includes(i.toString())) {
                generate(moves + i);
            }
        }
    }
}

generate(START_MOVES);
console.log("Generated all files starting from " + START_MOVES);
