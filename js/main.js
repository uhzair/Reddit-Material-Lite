var after = '';
var currentSub = '';
var home = $('#home');
var doomedYet = false;
var adding = false;
var savedSubReddits = localStorage.ssrs ? JSON.parse(localStorage.ssrs) : [];

if (savedSubReddits.length > 0){
    $.each(savedSubReddits, function(i,j){
        $('nav').append(`<a class="mdl-navigation__link" href="${j}" id="srnav">${j}</a>`);
    });
    currentSub = savedSubReddits.join('+');
    refresh();
}

setInterval("registerComponents();", 500);

$('#addSub').change(function() {
    if (adding) {
        addSubReddit($(this).val());
    }
    $(this).val('');
});

$('#home').on('click', '.threadlink', function(event) {
    var url = $(this).attr('href');
    if (url.indexOf('reddit.com') >= 0) {
        event.preventDefault();
        loadThread($(this).attr('href'));
    }
});

$('#addSubReddit').click(function() {
    toggleCtrls();
});

$('#finishAdd').click(function() {
    toggleCtrls();
});

$('nav').on('click', '#srnav', function(event) {
    event.preventDefault();
    currentSub = $(this).text();
    refresh();
    $('#header,title').text('/r/' + currentSub);
});

$('#main').bind('scroll', areweatthebottomYet);

function addSubReddit(subreddits) {
    subreddits = subreddits.split(',');
    $.each(subreddits, function(i,j){
        $('nav').append(`<a class="mdl-navigation__link" href="${j}" id="srnav">${j}</a>`);
    });
    savedSubReddits = savedSubReddits.concat(subreddits);
    localStorage.ssrs = JSON.stringify(savedSubReddits);
}

function loadThreads(viewingPost,permalink) {
    $.ajax({
        url: 'https://www.reddit.com/r/' + currentSub + '/.json?after=' + after,
        success: function(data) {
            after = data.data.after;
            doomedYet = (after === null) ? true: false;
            var threadsdata = data.data.children;
            $.each(threadsdata, function(i, j) {
                if (!viewingPost && permalink != j.data.permalink) {
                    home.append(`
                            <div class="thread-card-wide mdl-card mdl-shadow--2dp">
                                <div class="mdl-card__title">
                                    <div class="votes">
                                        <i class="material-icons icon">keyboard_arrow_up</i>
                                        ${j.data.score}
                                        <i class="material-icons icon">keyboard_arrow_down</i>
                                    </div>
                                    <p class="threadtitle">
                                        ${j.data.title}
                                    </p>
                                    <br/>
                                    <p class="domain">
                                        (${j.data.domain})
                                    </p>
                                </div>
                                <div class="mdl-card__actions mdl-card--border">
                                    <a class="nsfw-${j.data.over_18} mdl-button mdl-js-button mdl-button--raised mdl-button--accent">
                                        NSFW
                                    </a>
                                    <a href="${j.data.url}" target="_blank" class="threadlink mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">
                                        View
                                    </a>
                                    <a href="http://www.reddit.com${j.data.permalink}" target="_blank" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">
                                        Permalink
                                    </a>
                                </div>
                            </div>
                        `);
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            errorThrown ? alert(errorThrown) : alert('There was an error with the request');
            homeSweetHome();
        }
    });
}

function loadThread(src) {
    after = '';
    home.html('');
    $.ajax({
        url: src + '.json',
        success: function(data) {
            var threaddata = data[0].data.children[0].data;
            home.prepend(`<div class="thread-card-wide mdl-card mdl-shadow--2dp">
                            <div class="mdl-card__title">
                                <div class="votes">
                                    <i class="material-icons icon">keyboard_arrow_up</i>
                                    ${threaddata.score}
                                    <i class="material-icons icon">keyboard_arrow_down</i>
                                </div>
                                <h2 class="mdl-card__title-text threadtitle">${threaddata.title}</h2>
                            </div>
                            <div class="mdl-card__actions mdl-card--border">
                                <div id="threadcontent"></div>
                            </div>
                            <div class="mdl-card__actions mdl-card--border">
                                <a href="http://www.reddit.com${threaddata.permalink}" target="_blank" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">
                                    Permalink
                                </a>
                            </div>
                        </div>
                        <div class="mdl-cell mdl-cell--12-col">
                            <h5>Other Posts</h5>
                        </div>`);
            $('#threadcontent').html($("<p/>").html(threaddata.selftext_html).text());
            loadThreads(true,threaddata.permalink);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            errorThrown ? alert(errorThrown) : alert('There was an error with the request');
        }
    });
}

function toggleCtrls(){
    $('#addSubReddit, #finishAdd, #form').toggle();
    adding = !adding;
}

function refresh() {
    after = '';
    home.html('');
    loadThreads();
    $('.closebtn').css('display','inline-block');
}

function homeSweetHome() {
    currentSub = '';
    after = '';
    home.html(`
            <div class="info">
                    <h5>Reddit Material</h5>
                    <p>Lightweight Reddit client built on top of Material Design Lite. You can read thread's original post or view linked content, nothing else.</p>
            </div>
            <div>
                <a href="#" onclick="alert('soon');" class="settings">settings</a>
            </div>`);
    $('#header,title').text('Reddit Material');
    $('.closebtn').css('display','none');
    adding = false;
}

function areweatthebottomYet(e) {
    if (!doomedYet && currentSub != '') {
        var elem = $(e.currentTarget);
        if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
            loadThreads();
        }
    }
}

function registerComponents(){
    componentHandler.upgradeAllRegistered();
}
