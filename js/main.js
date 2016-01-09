var after = '';
var subReddit = '';
var home = $('#home');
var doomedYet = false;
$('#subreddit').change(function() {
    if ($(this).val()) {
        subReddit = $(this).val();
        after = '';
        home.html('');
        loadThreads();
        $('#header,title').text('/r/' + subReddit);
    } else {
        subReddit = '';
        after = '';
        home.html(`<div class="info">
                        <h5>Reddit Material</h5>
                        <p>Reddit client built on top of Material Design Lite. You can only read threads main post or view linked content, nothing else.</p>
                    </div>`);
        $('#header,title').text('Reddit Material');
    }
});
$('#homenav').click(function() {
    if (subReddit != '') {
        event.preventDefault();
        after = '';
        home.html('');
        loadThreads();
    }
});
$('#home').on('click', '.threadlink', function(event) {
    var url = $(this).attr("href");
    if (url.indexOf("reddit.com") >= 0) {
        event.preventDefault();
        loadThread($(this).attr("href"));
    }
});
$('#main').bind('scroll', areweatthebottomYet);

function loadThreads() {
    $.ajax({
        url: "https://www.reddit.com/r/" + subReddit + "/.json?after=" + after,
        success: function(data) {
            after = data.data.after;
            (after == null) ? doomedYet = true: doomedYet = false;
            var threadsdata = data.data.children;
            $.each(threadsdata, function(i, j) {
                home.append(`<div class="thread-card-wide mdl-card mdl-shadow--2dp">
					<div class="mdl-card__title">
					<h2 class="mdl-card__title-text threadtitle">${j.data.title}</h2>
					<br><p class="domain">(${j.data.domain})</p>
					</div>
					<div class="mdl-card__actions mdl-card--border">
					<a class="nsfw-${j.data.over_18} mdl-button mdl-js-button mdl-button--raised mdl-button--accent">
					NSFW
					</a>
					<a href="${j.data.url}" target="_blank" class="threadlink mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
					View
					</a>
					<a href="http://www.reddit.com${j.data.permalink}" target="_blank" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
					Permalink
					</a>
					</div>
					</div>`);
            });
            loadingThreads = false;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            errorThrown ? alert(errorThrown) : alert('There was an error with the request');
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
					<h2 class="mdl-card__title-text threadtitle">${threaddata.title}</h2>
					</div>
					<div class="mdl-card__actions mdl-card--border">
					<div id="threadcontent"></div>
					</div>
					</div>
					<div class="mdl-cell mdl-cell--12-col"><h5>Threads</h5></div>`);
            $('#threadcontent').html($("<p/>").html(threaddata.selftext_html).text());
            loadThreads();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            errorThrown ? alert(errorThrown) : alert('There was an error with the request');
        }
    });
}

function areweatthebottomYet(e) {
    if (!doomedYet) {
        var elem = $(e.currentTarget);
        if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
            loadThreads();
        }
    }
}