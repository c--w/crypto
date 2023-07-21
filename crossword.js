const N = 100;
const border_light_color = 'var(--border-light-color)';
var coords;
var g_rows;
var g_cols;
var all_letters_arr;

var grid, grid2;
var minx, miny, maxx, maxy;

var letter_points;
function initGrid() {
    grid = new Array(N); //create 2 dimensional array for letter grid
    for (var i = 0; i < N; i++) {
        grid[i] = new Array(N);
        for (var j = 0; j < N; j++) {
            grid[i][j] = '';
        }
    }
}

function placeWord(xf, yf, done, doneall) {
    let best_score = -1;
    let best_coord = { all: [] };
    while (best_score == -1) {
        for (let y = miny - 6; y < maxy + 7; y++) {
            for (let x = minx - 6; x < maxx + 7; x++) {
                let pattern = '';
                for (let k = 0; k < 7; k++) {
                    let l = grid[y + k * yf][x + k * xf];
                    if (l)
                        pattern += l;
                    else
                        pattern += '.';
                }
                for (let j = 7; j > 3; j--) {
                    let score = 0;
                    let regex_str = '^' + pattern.substring(0, j) + '$';;
                    let regex = new RegExp(regex_str, 'g');;
                    let word = dw.find(w => w.match(regex));
                    if (!word)
                        continue;
                    if (all_guess_words.find((w) => w.join('') == word))
                        continue;
                    word = cdl(word);
                    for (let i = 0; i < word.length; i++) {
                        let c = word[i];
                        let xx = x + i * xf;
                        let yy = y + i * yf;
                        if (grid[yy][xx] == c) {
                            if (coords.find((coord) => {
                                return coord.xf == xf && coord.all.find(c => c.x == xx && c.y == yy);
                            })) { // never use chars of same oriented word
                                score = -1;
                                break;
                            } else {
                                score++;
                            }
                        } else if (grid[y + i * yf][x + i * xf] != '') { // clash with another word
                            score = -1;
                            break;
                        }
                    }
                    let letter_score = word.reduce((acc, l) => acc + letter_points[l], 0);
                    score += letter_score;
                    if (score > best_score) {
                        best_score = score;
                        best_coord.x = x;
                        best_coord.y = y;
                        best_coord.l = word.length;
                        best_coord.w = word;
                        best_coord.xf = xf;
                        best_coord.ls = letter_score;
                    }
                }
            }
        }
    }
    if (best_score == 0) {
        best_coord.x += 6 * (1 - xf);
    }
    for (let i = 0; i < best_coord.w.length; i++) {
        c = best_coord.w[i];
        grid[best_coord.y + i * yf][best_coord.x + i * xf] = c;
        best_coord.all.push({ x: best_coord.x + i * xf, y: best_coord.y + i * yf })
    }
    done(best_coord, doneall);
}


function handleWord(coord, doneall) {
    let xf, yf;
    let i = all_guess_words.length;
    if ((i % 5) % 2) {
        yf = 0;
    } else {
        yf = 1;
    }
    xf = 1 - yf;
    coords.push(coord);
    all_guess_words.push(coord.w);
    $('.progress-bar').css('width', all_guess_words.length / wordnum * 100 + '%')
    $('.progress-bar').text(all_guess_words.length + '/' + wordnum)
    if (coord.x < minx)
        minx = coord.x;
    if (coord.y < miny)
        miny = coord.y;
    if (coord.x + coord.l * xf > maxx)
        maxx = coord.x + coord.l * xf;
    if (coord.y + coord.l * yf > maxy)
        maxy = coord.y + coord.l * yf;
    finishBoard();
    if (all_guess_words.length < wordnum) {
        let i = all_guess_words.length;
        if ((i % 5) % 2) {
            yf = 0;
        } else {
            yf = 1;
        }
        xf = 1 - yf;
        setTimeout(placeWord, 0, xf, yf, handleWord, doneall);
    } else {
        $('.progress').hide();
        $("#hints").css("display", "flex");
        doneall();
    }
}

function fillBoard() { //instantiator object for making gameboards
    initGrid();
    let word = getRandomWord(7);
    all_guess_words.push(word);
    let startx = N / 2;
    let starty = N / 2;
    coords = [];
    let coord = { x: startx, y: starty, l: word.length, all: [], xf: 0, w: word, ls: word.reduce((acc, l) => acc + letter_points[l], 0) }
    coords.push(coord);
    for (let i = 0; i < word.length; i++) {
        grid[starty + i][startx] = word[i];
        coord.all.push({ x: startx, y: starty + i })
    }
    minx = coord.x;
    miny = coord.y;
    maxx = minx + 1;
    maxy = miny + coord.l;

    let xf, yf;
    let i = all_guess_words.length;
    if ((i % 5) % 2) {
        yf = 0;
    } else {
        yf = 1;
    }
    xf = 1 - yf;
    setTimeout(placeWord, 0, xf, yf, handleWord, finishBoard);
}

function initGrid2() {
    g_rows = maxy - miny;
    g_cols = maxx - minx;
    grid2 = new Array(g_rows);
    $('#all_words_div').empty();
    let all_letters = new Set();
    for (var i = 0; i < g_rows; i++) {
        grid2[i] = new Array(g_cols);
        for (var j = 0; j < g_cols; j++) {
            let l = grid[i + miny][j + minx];;
            grid2[i][j] = l;
            let div = $('<div>');
            if (l) {
                div.addClass('full');
                all_letters.add(l);
                let n = Array.from(all_letters).indexOf(l);
                div.html('<span>' + n + '<span/>');
                div.data('l', l);
                div.data('n', n);
                div.attr('n', n);
                div.attr('l', l);
            }
            $('#all_words_div').append(div);
        }
    }
    //console.table(grid2);
}

function finishBoard() {
    initGrid2();
    let all_divs = $($('#all_words_div div'));
    let color_step = Math.floor(360 / all_guess_words.length);
    coords.forEach((c, i) => {
        let xf = c.xf;
        let yf = 1 - xf;
        let color = "hsl(" + color_step * i + "deg 100% 50% / 0.2)";
        let x = c.x - minx;
        let y = c.y - miny;
        for (let j = 0; j < c.l; j++) {
            let xx = x + j * xf;
            let yy = y + j * yf;
            let div = $(all_divs[yy * g_cols + xx])
            let bckg = $('<div class="bckg">');
            bckg.css("background", color);
            div.append(bckg);
            if (!xf) {
                if (j == 0) {
                    div.addClass('top');
                    div.append('<i class="bottom">')
                } else if (j == c.l - 1) {
                    div.addClass('bottom')
                    div.append('<i class="top">')
                } else {
                    div.addClass('vertical')
                    div.append('<i class="bottom">')
                    div.append('<i class="top">')
                }
            } else {
                if (j == 0) {
                    div.addClass('left')
                    div.append('<i class="right">')
                } else if (j == c.l - 1) {
                    div.append('<i class="left">')
                    div.addClass('right')
                } else {
                    div.addClass('horizontal')
                    div.append('<i class="right">')
                    div.append('<i class="left">')
                }
            }
        }
    })
    calculateCSS();
}

function calculateCSS() {
    let innerWidth = screen.width;
    if (screen.width < screen.height)
        ;//innerWidth *= screen.height/screen.width;
    let width = Math.floor(innerWidth / (g_cols));
    if (width > 80)
        width = 80;
    let margin = Math.ceil(width / 32);
    let margin2 = Math.ceil(margin / 1.5);
    //width = width - 2*margin;
    document.querySelector(':root').style.setProperty('--main-box-margin', margin + 'px');
    document.querySelector(':root').style.setProperty('--inner-box-margin', margin2 + 'px');
    document.querySelector(':root').style.setProperty('--box-border-width', margin + 'px');
    $('#all_words_div').css("grid-template-columns", "repeat(" + g_cols + ", " + width + "px)");
    $('#all_words_div').css("grid-template-rows", "repeat(" + g_rows + ", " + width + "px)");
    $('#all_words_div').css("font-size", width / 1.8 + "px");
}

function makeRegex(pattern) {
    let tmp = pattern.split('');
    let result = '';
    let nc = 0, ndot = 0;
    tmp.forEach(c => {
        if (c != '.') {
            if (ndot != 0) {
                if (ndot == 1) {
                    result += '.';
                    nc++;
                } else {
                    result += '.{' + ndot + '}'
                    nc += ndot;
                }
                ndot = 0;
            }
            result += c;
            nc++;
        } else
            ndot++;
    });
    /*
    if (ndot != 0) {
        let min = 0;
        if (nc < 4)
            min = 4 - nc;
        result += '.{' + min + ',' + ndot + '}'
    }
    */
    result = '^' + result + '$';
    const regex = new RegExp(result, 'g');
    return regex;
}
