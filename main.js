onload = (event) => init();
var all_guess_words;
var last_time = 0;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
var startseed;
var letters;
var gamemode;
var level;
var wordnum;
var last_selected;
var hints;
const VERSION = "v4.0";
function init() {
    $('#version').text(VERSION);
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
    resolve('gamemode')
    resolve('level')
    resolve('wordnum')
    $("#gamemode").on("change", changeGame);
    $("#level").on("change", changeGame);
    $("#wordnum").on("change", changeGame);
    changeGame();
    window.addEventListener("resize", function () {
        calculateCSS();
    }, false);
}

function changeGame() {
    gamemode = Number($("#gamemode").val());
    letters = gamemode;
    setCookie("gamemode", gamemode, 730);
    level = $("#level").val();
    setCookie("level", level, 730);
    wordnum = $("#wordnum").val();
    setCookie("wordnum", wordnum, 730);
    if (gamemode > 7) {
        $('#level').hide();
        $('#wordnum').hide();
    } else {
        $('#level').show();
        $('#wordnum').show();
    }
    setup_dw();
    last_time = 0;
    total_time = 0;
    games = 0;
    start_time = 0;
    initKeyboard();
    setBckg();
    initGame();
}

function setupHints() {
    let hints_div = $('#hints');
    hints_div.empty();
    for (let i = 0; i < hints; i++) {
        hints_div.append($('<i class="bi bi-lightbulb-fill"></i>'))
    }
}

function initKeyboard() {
    if (level == 4 || gamemode > 7) {
        ["Š", "Đ", "Č", "Ć", "Ž", "NJ", "DŽ", "LJ"].forEach(l => $('[l="' + l + '"]').hide());
        ["Q", "W", "X", 'Y'].forEach(l => $('[l="' + l + '"]').show());
    } else {
        ["Š", "Đ", "Č", "Ć", "Ž", "NJ", "DŽ", "LJ"].forEach(l => $('[l="' + l + '"]').show());
        ["Q", "W", "X", 'Y'].forEach(l => $('[l="' + l + '"]').hide());
    }
    $("#keyboard-div").hide();
}

function initGame() {
    stopFireworks();
    $('#continue').hide();
    startseed = seed;
    let seed_url;
    seed_url = gamemode + "-" + level + "-" + wordnum + "-" + startseed;

    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    $("#seed").attr('title', startseed);
    $('#hints i').show();
    $('.key').removeClass('success');
    all_guess_words = [];
    $('#hints').hide();
    $(".progress").show();
    $('.progress-bar').css('width', all_guess_words.length / wordnum * 100 + '%')
    $('.progress-bar').text(all_guess_words.length + '/' + wordnum)
    shuffle(dw);
    if (gamemode == 8) {
        hints = 4;
        fillBoardQuotes();
    } else if (gamemode == 9) {
        hints = 4;
        fillBoardFacts();
    } else {
        hints = 7 - wordnum / 10;
        fillBoard();
    }
    $('#all_words_div').show();
    setupHints();
    updateStats();
    start_time = Date.now();
}

var click_time = 0;
function handleClick(event) {
    if (Date.now() - click_time < 100)
        return false;
    click_time = Date.now();
    let el = $(event.target);
    if (!el.hasClass('full'))
        el = el.parent();
    if (el.hasClass('clickable')) {
        effect(el);
        let num = el.data('n');
        let l = el.data('l');
        if (hints) {
            if (el.hasClass('l'))
                return;
            revealLetter(num, l, null, true);
            $($('#hints i:visible')[0]).hide();
            hints--;
            return;
        } else {
            if (el.hasClass('fixed')) {
                return;
            }
            $("#all_words_div div").removeClass('selected')
            $('#all_words_div div[n=' + num + ']').addClass('selected');
        }
        $("#keyboard-div").css('display', 'flex');
        showKeyboard(el);
    } else {
        $("#keyboard-div").hide();
    }
    return;
}

function showKeyboard(el) {
    let scale = (window.visualViewport.width || screen.width) / screen.width;
    const target = el;
    const popover = $("#keyboard-div");
    popover.css('transform', 'scale(' + scale + ')');
    popover.css('-webkit-transform', 'scale(' + scale + ',' + scale + ')');

    const targetRect = target.offset();
    const popoverRect = popover.offset();
    let w = popover.width();
    let top = targetRect.top + target.height() - (1 - scale) * popover.height() / 2;
    let left = targetRect.left + target.width() / 2 - w / 2;
    if (left < -(1 - scale) * w / 2)
        left = -(1 - scale) * w / 2;
    if (left + w - w * (1 - scale) / 2 > screen.width)
        left = screen.width - w + w * (1 - scale) / 2;
    popover.css("top", `${top + 8}px`);
    popover.css("left", `${left}px`);
}

function revealLetter(num, l, del, fixed) {
    let divs = $('#all_words_div div[n=' + num + ']');
    $("#all_words_div div").removeClass('selected')
    divs.addClass('selected');
    if (fixed)
        divs.addClass('fixed');
    if (del) {
        divs.removeClass('l');
        divs.toArray().forEach(div => $(div).find('span')[0].innerHTML = num);
        $('.key[l=' + l + ']').removeClass('success');
    } else {
        divs.addClass('l');
        divs.toArray().forEach(div => {
            $(div).find('span')[0].innerHTML = l;
        });
        $('.key[l=' + l + ']').addClass('success');
    }
}

function handleKeyClick(event) {
    let key = $(event.target);
    $("#keyboard-div").hide();
    let selected = $('#all_words_div div.selected');
    let num = selected.data('n');
    let ll = $('#all_words_div div.selected span')[0].innerText;
    let l = key.data('l');
    if (key.hasClass('del')) {
        if (!isNaN(Number(selected.text())))
            return;
        l = $(selected[0]).text();
        revealLetter(num, l, true)
    } else {
        let l = key.data('l');
        if (isNaN(Number(ll))) {
            $('.key[l=' + ll + ']').removeClass('success');
        }
        revealLetter(num, l)
        if (solved()) {
            setTimeout(() => {
                $('#all_words_div > div.full').addClass('winner2');
            }, 500)

            startFireworks();
            games++;
            last_time = Math.round((Date.now() - start_time) / 1000);
            total_time += last_time;
            $('#continue').show();
        }
    }
}
function solved() {
    return !$('#all_words_div > div.full span').toArray().find(span => {
        return span.innerText != $(span).parent().data('l');
    })
}
function shuffle(a) {
    for (let i = 0; i < a.length; i++) {
        let i1 = Math.floor(a.length * rand());
        let i2 = Math.floor(a.length * rand());
        let tmp = a[i1];
        a[i1] = a[i2];
        a[i2] = tmp;
    }
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
        wordnum = Number(tmp[2])
        seed = Number(tmp[3]);
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
        if (len)
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
    let key = 'words' + games + '-' + gamemode + '-' + level + '-' + wordnum;
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

function resolve(prop, num) {
    let value = window[prop];
    if (typeof value == 'undefined') {
        value = getCookie(prop);
        if (!value) {
            value = $('#' + prop).val();
            window[prop] = value;
            return;
        }
    }
    let options = $('#' + prop + ' option');
    let values = $.map(options, function (option) {
        return option.value;
    });
    if (values.indexOf("" + value) == -1) {
        value = values[0];
    }
    if (num)
        value = Number(value);
    window[prop] = value;
    $('#' + prop).val(value);
    setCookie(prop, value, 730);
}