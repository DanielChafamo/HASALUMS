
$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar-item'),
      $crum = $('.breadcrums'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      $addformButton = $('#addform_button'),
      $createPostForm = $('#create_post'), 
      $deletePostButton = $('.deleteblog'), 
      crumOffsetTop = $crum.offset().top,
      navOffsetTop = $nav.offset().top,
      $document = $(document),
      toc = document.querySelector( '.leftsidebar' ),
      tocPath = document.querySelector( '.toc-marker path' ),
      TOP_MARGIN = 0.1,
      BOTTOM_MARGIN = 0.2, 
      pathLength,
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }
    var tocItems;

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    // $popoverLink.hover(openPopover)//, closePopover)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $addformButton.on('click', openAddForm)
    $createPostForm.on('submit', createPostForm)
    $deletePostButton.on('click', deletePost) 
    $('form[id^="update_post"]').on('submit', updatePostForm)
    $('a[href^="#"]').on('click', toPost)
    $('button[id^="edit_"]').on('click', editForm)
    $('button[id^="like_"]').on('click', like)
    $('button[id^="comment_"]').on('click', comment)
    $('button[id^="bookmark_"]').on('click', bookmark)
    buildSnippets();
    markLikesBookmarks();
    showChangeButtons();
    drawPath(); 
  }

  function createPostForm(e) {
    e.preventDefault(); 
    var $target = e.currentTarget;
    $.ajax({
      url: '/ajax/create_post/',
      method: 'POST',
      data: {
        'title': $target[1].value,
        'text': $target[2].value, 
        'destination': $target[3].value
      },
      dataType: 'json',
      success: function (data) { 
        if (data["success"]) {
          $target[1].value = ""
          $target[2].value = "" 
          $("#form_add_form").toggle(); 
          let curr = $target.action.split('/')[3];
          if (curr == "") curr = "Home";
          if (curr == data['destination']) {
            var post = data;
            $('#postset').after($.parseHTML("{% autoescape off %}{% include 'Cogito/post_view.html' %}{% endautoescape off %}")[0]);
          }
        } else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
  }

  function updatePostForm(e) {
    e.preventDefault(); 
    var $target = e.currentTarget;
    $.ajax({
      url: '/ajax/update_post/',
      method: 'POST',
      data: {
        'title': $target[1].value,
        'text': $target[2].value, 
        'destination': $target[3].value,
        'pid': $target[4].value,
      },
      dataType: 'json',
      success: function (data) { 
        if (data["success"]) {
          $form = $('#form_' + data['pid']);
          $form.toggle();
          let curr = $target.action.split('/')[3];
          if (curr == "") curr = "Home";
          if (curr == data['destination']) {
            $post = $('#post_' + data['pid']); 
            var $children = $post.children();
            $children[0].innerText = data["title"];
            $children[1].innerText = data["text"];
            $post.toggle();
            console.log($children)
          } else {
            $section = $('#section_' + data['pid']); 
            $section.toggle();
          }
        } else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
  }

  function deletePost(e) { 
    e.preventDefault(); 
    $.ajax({
      url: '/ajax/delete_post/',
      method: 'POST',
      data: {'pid': e.target.id.split('_')[1]},
      dataType: 'json',
      success: function (data) { 
        if (data["success"]) {
          $('#section_'+data['pid']).toggle()
        } else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
  }

  function like(e) { 
    $.ajax({
      url: '/ajax/log_response/',
      method: 'POST',
      data: {'type': 'like', 'pid': e.target.id.split('_')[1]},
      dataType: 'json',
      success: function (data) { 
        if (data["success"]) {
          $('#'+e.target.id)[0].style.background = 
            "url(../static/Cogito/img/icon-heart.svg) 0 1px no-repeat";
          $target = $('#like_count_'+e.target.id.split('_')[1]);
          $target[0].text = parseInt($target[0].text)+1;
        } else if (data["redirect"]) {
          window.location.href = data["redirect"]
        }else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
  }

  function comment(e) {
    $('#'+e.target.id)[0].style.background = 
      "url(../static/Cogito/img/icon-comment.svg) 0 1px no-repeat";
  }

  function bookmark(e) {
    $.ajax({
      url: '/ajax/log_response/',
      method: 'POST',
      data: {'type': 'bookmark', 'pid': e.target.id.split('_')[1]},
      dataType: 'json',
      success: function (data) {  
        if (data["success"]) {
          $('#'+e.target.id)[0].style.background = 
            "url(../static/Cogito/img/icon-bookmark.svg) 0 1px no-repeat";
        } else if (data["redirect"]) {
          window.location.href = data["redirect"]
        } else if (data["error"]) {
          console.log(data["error"]);
        }
      }
    });
  }

  function openAddForm() {
    $("#form_add_form").toggle(); 
    $("html, body").animate({ scrollTop: $document.height() }, "fast");
  }

  function editForm(e) {
    $form = $('#form_' + e.target.id.split('_')[1]);
    $post = $('#post_' + e.target.id.split('_')[1]); 
    $form.toggle();
    $post.toggle();
  }

  function toPost(e) { 
    if ($("#crumlink")[0]) {
      $("#crumlink")[0].innerText = e.target.innerHTML
      $("#crumlink")[0].href = e.target.hash
    } else {
      $crumlink = $.parseHTML('&rsaquo; <a id="crumlink" href='+e.target.hash+'>'+e.target.innerHTML+'</a>');
      $('.breadcrums')[0].lastChild.after($crumlink[0]);
      $('.breadcrums')[0].lastChild.after($crumlink[1]);
    }
    smoothScroll(e);
  }
  function smoothScroll(e) {
    e.preventDefault(); 
    $(document).off("scroll");
    var target = e.target.hash;
    $('html, body').animate({
        scrollTop: $(target).offset().top - 100
    }, 200);
    onScroll();
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
  });

  $('#toggle_bookmarked').click(function() {
    console.log('b_e')
    $('#bookmarked_entries').toggle()
    $('#postset').toggle()
  });


  function resize() { 
    drawPath();
    $body.removeClass('has-docked-crum') 
    $body.removeClass('has-docked-nav') 
    crumOffsetTop = $crum.offset().top
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() { 
    sync();
    if(crumOffsetTop  < $window.scrollTop()+70 && !$body.hasClass('has-docked-crum')) {
      $body.addClass('has-docked-crum')
    }
    if(crumOffsetTop > $window.scrollTop()+70 && $body.hasClass('has-docked-crum')) {
      $body.removeClass('has-docked-crum')
    }

    if(navOffsetTop  < $window.scrollTop()+15 && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop()+15 && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function() {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }

  function markLikesBookmarks() { 
    for (var i = liked.length - 1; i >= 0; i--) { 
      $('#like_'+liked[i])[0].style.background = 
        "url(../static/Cogito/img/icon-heart.svg) 0 1px no-repeat";
    }  
    for (var i = bookmarked.length - 1; i >= 0; i--) {
      $('#bookmark_'+bookmarked[i])[0].style.background = 
        "url(../static/Cogito/img/icon-bookmark.svg) 0 1px no-repeat";
    } 
  }

  function showChangeButtons() {
    for (var i = created.length - 1; i >= 0; i--) 
      $('#changes_'+created[i]).toggle();
  }

  function drawPath() { 
    tocItems = [].slice.call( toc.querySelectorAll( 'li' ) );
    // Cache element references and measurements
    tocItems = tocItems.map( function( item ) {
      var anchor = item.querySelector( 'a' );
      var target = document.getElementById( anchor.getAttribute( 'href' ).slice( 1 ) );
      return {
        listItem: item,
        anchor: anchor,
        target: target 
      };
    } );
    // Remove missing targets
    tocItems = tocItems.filter( function( item ) {
      return !!item.target;
    } );
    var path = [];
    var pathIndent;
    tocItems.forEach( function( item, i ) {
      var x = item.anchor.offsetLeft - 5,
          y = item.anchor.offsetTop,
          height = item.anchor.offsetHeight;
      if( i === 0 ) {
        path.push( 'M', x, y, 'L', x, y + height );
        item.pathStart = 0;
      }
      else {
        // Draw an additional line when there's a change in
        // indent levels
        if( pathIndent !== x ) path.push( 'L', pathIndent, y );
        path.push( 'L', x, y );
        // Set the current path so that we can measure it
        tocPath.setAttribute( 'd', path.join( ' ' ) );
        item.pathStart = tocPath.getTotalLength() || 0; 
        path.push( 'L', x, y + height );
      }
      pathIndent = x;
      tocPath.setAttribute( 'd', path.join( ' ' ) );
      item.pathEnd = tocPath.getTotalLength();
    } );
    pathLength = tocPath.getTotalLength(); 
  }

  function sync() {
    drawPath();
    var windowHeight = window.innerHeight;
    var pathStart = pathLength,
        pathEnd = 0;
    var visibleItems = 0;
    tocItems.forEach( function( item ) {
      var targetBounds = item.target.getBoundingClientRect();
      if( targetBounds.bottom > windowHeight * TOP_MARGIN && targetBounds.top < windowHeight * ( 1 - BOTTOM_MARGIN ) ) {
        pathStart = Math.min( item.pathStart, pathStart );
        pathEnd = Math.max( item.pathEnd, pathEnd );
        visibleItems += 1;
        item.listItem.classList.add( 'visible' );
      }
      else {
        item.listItem.classList.remove( 'visible' );
      }
      
    } );
    // Specify the visible path or hide the path altogether
    // if there are no visible items
    if( visibleItems > 0 && pathStart < pathEnd ) {
      tocPath.setAttribute( 'stroke-dashoffset', '1' );
      tocPath.setAttribute( 'stroke-dasharray', '1, '+ pathStart +', '+ ( pathEnd - pathStart ) +', ' + pathLength );
      tocPath.setAttribute( 'opacity', 1 );
    }
    else {
      // tocPath.setAttribute( 'opacity', 0 );
    }
  }

  init();

});