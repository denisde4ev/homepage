#!/usr/bin/awk -f

function check_win(board,    wins, i, a, b, c) {
    # Define winning combinations
    wins[1] = "1 2 3"; wins[2] = "4 5 6"; wins[3] = "7 8 9"
    wins[4] = "1 4 7"; wins[5] = "2 5 8"; wins[6] = "3 6 9"
    wins[7] = "1 5 9"; wins[8] = "3 5 7"
    
    for (i = 1; i <= 8; i++) {
        split(wins[i], combo, " ")
        a = board[combo[1]]; b = board[combo[2]]; c = board[combo[3]]
        if (a != "" && a == b && a == c) return a
    }
    
    # Check for draw
    for (i = 1; i <= 9; i++) if (board[i] == "") return ""
    return "draw"
}

function generate(moves,    board, i, pos, winner, turn, actions_log, status_text, table_rows, html, file, next_moves) {
    # Initialize board
    for (i = 1; i <= 9; i++) board[i] = ""
    
    # Fill board from moves
    for (i = 1; i <= length(moves); i++) {
        pos = substr(moves, i, 1)
        board[pos] = (i % 2 != 0 ? "X" : "O")
    }
    
    winner = check_win(board)
    turn = (length(moves) % 2 == 0 ? "X" : "O")
    
    # Build actions log
    actions_log = "<font size=\"4\"><b><i>Actions log:</i></b></font>\n"
    for (i = 1; i <= length(moves); i++) {
        actions_log = actions_log (i % 2 != 0 ? "X" : "O") ": " substr(moves, i, 1) "\n"
    }
    # Add padding for pre tag
    for (i = length(moves); i < 11; i++) actions_log = actions_log "\n"
    
    # Build status text
    if (winner == "draw") status_text = "<b>IT'S A DRAW!</b>"
    else if (winner != "") status_text = "<b>PLAYER " winner " WINS!</b>"
    else status_text = "<b>PLAYER " turn " TURN</b>"
    
    # Build table rows
    table_rows = ""
    for (r = 0; r < 3; r++) {
        table_rows = table_rows "          <tr>\n"
        for (c = 1; c <= 3; c++) {
            idx = r * 3 + c
            if (board[idx] != "") {
                table_rows = table_rows "           <td align=\"center\" bgcolor=\"#9BBC0F\">" board[idx] "</td>\n"
            } else if (winner != "") {
                table_rows = table_rows "           <td align=\"center\" bgcolor=\"#9BBC0F\">&nbsp;&nbsp;</td>\n"
            } else {
                table_rows = table_rows "           <td align=\"center\" bgcolor=\"#9BBC0F\"><button formaction=\"" moves idx ".html\">&nbsp;&nbsp;</button></td>\n"
            }
        }
        table_rows = table_rows "          </tr>\n"
    }
    
    # Construct complete HTML
    html = "<html>\n" \
    "<!-- https://www.transparenttextures.com/patterns/stardust.png -->\n" \
    "<body bgcolor=\"#E0E0E0\" text=\"#333333\" link=\"#8B0000\" vlink=\"#550000\" alink=\"#FF0000\">\n" \
    "\n" \
    "  <center>\n" \
    "\n" \
    "   <br><br>\n" \
    "\n" \
    "   \n" \
    "   <!-- Top Navigation (Game Boy Style) -->\n" \
    "   <table width=\"100%\" bgcolor=\"#999999\" cellspacing=\"0\" cellpadding=\"5\" border=\"0\">\n" \
    "    <tr>\n" \
    "     <td align=\"center\">\n" \
    "      <font face=\"Courier New, Courier, monospace\" size=\"4\">\n" \
    "       <b>\n" \
    "       [ <a href=\"../index.html\">START</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../blog.html\">SELECT</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../portfolio.html\">ITEMS</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../cyber.html\">LINK</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../nature.html\">WORLD</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../hotdog.html\">FOOD</a> ] &nbsp;&nbsp;\n" \
    "       [ <a href=\"../cards.html\">CARD</a> ]\n" \
    "       </b>\n" \
    "      </font>\n" \
    "     </td>\n" \
    "    </tr>\n" \
    "   </table>\n" \
    "   \n" \
    "   <br><br>\n" \
    "\n" \
    "   <!-- Screen Bezel -->\n" \
    "   <table width=\"600\" border=\"0\" cellpadding=\"20\" cellspacing=\"0\" bgcolor=\"#505050\">\n" \
    "    <tr>\n" \
    "     <td align=\"center\" colspan=\"100\">\n" \
    "      \n" \
    "      <!-- Screen Area -->\n" \
    "      <table width=\"100%\" border=\"0\" cellpadding=\"10\" cellspacing=\"0\" bgcolor=\"#9BBC0F\"> <!-- Classic GB Greenish tint or just grey #C0C0C0 -->\n" \
    "       <tr>\n" \
    "        <td align=\"center\">\n" \
    "         \n" \
    "         <font face=\"Verdana, Geneva, sans-serif\" size=\"6\" color=\"#0F380F\"><b>TIC-TAC-TOE</b></font>\n" \
    "         <br>\n" \
    "         <font face=\"Courier New, Courier, monospace\" size=\"2\" color=\"#306230\"><i>ver. 1.0</i></font>\n" \
    "         <br><br>\n" \
    "         \n" \
    "         <!-- Game Board -->\n" \
    "         <form method=\"GET\">\n" \
    "         <table border=\"4\" cellpadding=\"10\" cellspacing=\"5\" bgcolor=\"#0F380F\" bordercolor=\"#0F380F\">\n" \
    table_rows \
    "         </table>\n" \
    "         </form>\n" \
    "         \n" \
    "         <br>\n" \
    "         <font face=\"Courier New, monospace\" size=\"3\" color=\"#0F380F\">" status_text "</font>\n" \
    "         \n" \
    "        </td>\n" \
    "       </tr>\n" \
    "      </table>\n" \
    "      \n" \
    "     </td>\n" \
    "    </tr>\n" \
    "\n" \
    "    <!-- Bottom Controls Decoration -->\n" \
    "    <tr>\n" \
    "      <td></td>\n" \
    "      <td align=\"left\">\n" \
    "        <font color=\"#999999\">\n" \
    "<pre>\n" \
    actions_log \
    "</pre>\n" \
    "          <br>\n" \
    "        </font>\n" \
    "      </td>\n" \
    "      <td></td>\n" \
    "      <td></td>\n" \
    "    </tr>\n" \
    "   </table>\n" \
    "\n" \
    "   <br>\n" \
    "   <br>\n" \
    "   <font face=\"Arial\" size=\"1\" color=\"#666666\">\n" \
    "    Still 100% static site!\n" \
    "   </font>\n" \
    "\n" \
    "  </center>\n" \
    "\n" \
    " </body>\n" \
    "</html>"
    
    file = moves ".html"
    print html > file
    close(file)
    
    # Recursively generate next states if no winner
    if (winner == "") {
        for (i = 1; i <= 9; i++) {
            if (index(moves, i) == 0) {
                generate(moves i)
            }
        }
    }
}

BEGIN {
    generate("3")
    print "Generated all files starting from 3.html"
}
