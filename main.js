onload = (event) => init();
var all_guess_words;
var all_guess_words_arr;
var last_time = 0;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
var startseed;
var letters;
var gamemode;
var level;
var last_selected;
var hints;
function init() {
    let all_words_div = document.querySelector("#all_words_div");
    all_words_div.onclick = (event) => handleClick(event);
    $(".key")
        .toArray()
        .forEach((key) => {
            $(key).data("l", $(key).text());
            $(key).attr("l", $(key).text());
        });
    $(".key").on("click", handleKeyClick);

    initSeed();
    if (!gamemode) {// try cookie
        gamemode = Number(getCookie("gamemode"));
        level = Number(getCookie("level"));
    }
    if (isNaN(gamemode)) { // try select
        gamemode = $("#gamemode").val();
        level = $("#level").val();
    }
    if (gamemode < 4)
        gamemode = 5;
    if (level < 1)
        level = 1;
    $("#gamemode").val(gamemode);
    $("#level").val(level);
    setCookie("gamemode", gamemode, 730);
    setCookie("level", level, 730);
    $("#gamemode").on("change", changeGame);
    $("#level").on("change", changeGame);
    changeGame();
    window.onresize = function () {
        if (gamemode > 7)
            calculateCSS();
    }
}

function changeGame() {
    gamemode = Number($("#gamemode").val());
    if (gamemode > 7)
        letters = gamemode - 3;
    else
        letters = gamemode;
    setCookie("gamemode", gamemode, 730);
    level = $("#level").val();
    setup_dw();
    setCookie("level", level, 730);
    last_time = 0;
    total_time = 0;
    games = 0;
    start_time = 0;
    hints = 5;
    initKeyboard();
    setBckg();
    initGame();
}

function initKeyboard() {
    if (level == 4) {
        ["Š", "Đ", "Č", "Ć", "Ž", "NJ", "DŽ", "LJ"].forEach(l => $('[l="' + l + '"]').hide());
        ["Q", "W", "X", 'Y'].forEach(l => $('[l="' + l + '"]').show());
    } else {
        ["Š", "Đ", "Č", "Ć", "Ž", "NJ", "DŽ", "LJ"].forEach(l => $('[l="' + l + '"]').show());
        ["Q", "W", "X", 'Y'].forEach(l => $('[l="' + l + '"]').hide());
    }
    $("#keyboard-div").hide();;
}

function initGame() {
    startseed = seed;
    let seed_url;
    seed_url = gamemode + "-" + level + "-" + startseed;

    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    $("#seed").attr('title', startseed);
    guess_word = getRandomWord();
    findAllGuessWords();
    fillBoard(all_guess_words_arr);
    $('#all_words_div').show();
    updateStats();
    start_time = Date.now();
}

function findAllGuessWords() {
    all_guess_words = new Set();
    while(all_guess_words.size < 30) {
        all_guess_words.add(getRandomWord());
    }
    all_guess_words_arr = Array.from(all_guess_words);
    console.table(Array.from(all_guess_words));
}

var click_time = 0;
function handleClick(event) {
    if (Date.now() - click_time < 100)
        return false;
    click_time = Date.now();
    let el = $(event.target);
    if (el.hasClass('full') || el.parent().hasClass('full')) {
        if(!el.hasClass('full'))
            el = el.parent();
        effect(el);
        if(hints) {
            if(el.hasClass('l'))
                return;
            let num = el.data('n'); 
            let l = el.data('l');
            revealLetter(num, l);
            $($('#hints i:visible')[0]).hide();
            hints--;
            return;
        }
        $("#keyboard-div").css('display', 'flex');
        $("#all_words_div div").removeClass('selected')
        el.addClass('selected');
    }
    return;
}

function revealLetter(num, l, del) {
    let divs = $('#all_words_div div[n=' + num + ']'); 
    divs.addClass('success');
    setTimeout(() => {
        divs.removeClass('success');
    }, 1000)
    if(del) {
        divs.removeClass('l');
        divs.toArray().forEach(div => $(div).find('span')[0].innerHTML = num);
        $('.key[l='+l+']').removeClass('success');
    } else {
        divs.addClass('l');
        divs.toArray().forEach(div => { 
            $(div).find('span')[0].innerHTML = l;
        });
        $('.key[l='+l+']').addClass('success');
    }
}

function handleKeyClick(event) {
    let key = $(event.target);
    $("#keyboard-div").hide();
    let selected = $('#all_words_div div.selected');
    let num = selected.data('n');
    let l = key.data('l');
    if (key.hasClass('del')) {
        if (!isNaN(Number(selected.text())))
            return;
        l = selected.text();
        revealLetter(num, l, true)
    } else {
        let l = key.data('l');
        revealLetter(num, l)
        if(solved()) {
            setTimeout(() => {
                $('#all_words_div > div.full').addClass('winner2');
            }, 500)
            games++;
            last_time = Math.round((Date.now() - start_time) / 1000);
            total_time += last_time;
            setTimeout(initGame, 3000);
        }
    }
}
function solved() {
    return !$('#all_words_div > div.full span').toArray().find(span => {
        return span.innerHTML != $(span).parent().data('l');
    })
}
function randomsort(a, b) {
    return Math.random() * 2 - 1;
}

function rand() {
    seed++;
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function initSeed() {
    if (window.location.hash) {
        let tmp = window.location.hash.substring(1).split("-");
        gamemode = Number(tmp[0])
        level = Number(tmp[1])
        seed = Number(tmp[2]);
        if (!isNaN(seed))
            return;
    }
    let now = new Date();
    seed = now.toISOString().replaceAll("-", "").replaceAll("T", "").replaceAll(":", "").substring(2, 12);
    seed = Number(seed + '0000');
}


var dw;
function setup_dw() {
    if (level == 1) dw = hrdict1;
    else if (level == 2) dw = hrdict2;
    else if (level == 3) dw = hrdict3;
    else if (level == 4) dw = endict;
}


function getRandomWord(len) {
    let filtered = dw.filter((word) => {
        word = cdl(word);
        if(len)
            return word.length == len;
        else
            return word.length <= letters;
    });
    let i = Math.floor(rand() * filtered.length);
    let word = filtered[i];
    return cdl(word);
}

function setBckg() {
    var color = (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16);
    var url = "https://bg.siteorigin.com/api/image?2x=0&blend=40&color=%23" + color + "&intensity=10&invert=0&noise=0&pattern=" + g_patterns[Math.floor(Math.random() * g_patterns.length)];
    $('body').css('background-image', 'url(' + url + ')');
}

function effect(el) {
    el.addClass('effect');
    setTimeout((el) => el.removeClass('effect'), 100, el);
}

function updateStats() {
    $("#games").text(games);
    $("#last").text(last_time);
    $("#total").text(total_time);
    if (!games)
        return;
    let avg = Math.round(total_time / games);
    $("#avg").text(avg);
    let key = 'words' + games + '-' + gamemode + '-' + level;
    let best = localStorage.getItem(key);
    if (best) {
        best = Number(best);
        if (avg < best) {
            best = avg;
        }
    } else {
        best = avg;
    }
    localStorage.setItem(key, best);
    $("#best-games").text(games);
    $("#best").text(best);
}
