$(document).ready(function() {

  // Variables
  var $codeSnippets = $('.code-example-body'),
      $nav = $('.navbar'),
      $body = $('body'),
      $window = $(window),
      $popoverLink = $('[data-popover]'),
      $addformButton = $('#addform_button'),
      // $createPostForm = $('#create_post'),
      // $updatePostForm = $('#update_post'),
      // $deletePostForm = $('#delete_post'),
      navOffsetTop = $nav.offset().top,
      $document = $(document),
      entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $addformButton.on('click', openAddForm)
    // $createPostForm.on('submit', createPostForm)
    // $updatePostForm.on('submit', updatePostForm)
    // $deletePostForm.on('submit', deletePostForm)
    $('a[href^="#"]').on('click', smoothScroll)
    $('button[id^="edit_"]').on('click', editForm)
    $('button[id^="like_"]').on('click', like)
    $('button[id^="comment_"]').on('click', comment)
    $('button[id^="bookmark_"]').on('click', bookmark)
    buildSnippets();
  }

  function createPostForm(e) {
    e.preventDefault();
    console.log('form submitted', e.currentTarget);
    var $target = e.currentTarget;
    $.ajax({
      url: '/ajax/create_post/',
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
          let curr = target.action.split('/')[3];
          if (curr == "") curr = "Home";
          if (curr == data['destination']) {
            var post = data;
            $('#postset').add('{% include post_view.html %}')
          }
        } else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
  }

  function updatePostForm(e) {
    e.preventDefault();
    console.log('form submitted', e.currentTarget);
    var $target = e.currentTarget;
    $.ajax({
      url: '/ajax/update_post/',
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
          let curr = target.action.split('/')[3];
          if (curr == "") curr = "Home";
          if (curr == data['destination']) {
            $post = $('#post_' + data['pid']); 
            var $children = $post.children();
            $children[0].value = data["title"];
            $children[1].value = data["text"];
            $post.toggle();
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

  function deletePostForm(e) {
    e.preventDefault();
    console.log('form submitted', e.currentTarget);
    $.ajax({
      url: '/ajax/delete_post/',
      data: {''},
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
    $('#'+e.target.id)[0].style.background="url(../static/Cogito/img/icon-heart.svg) 0 1px no-repeat";

  }

  function comment(e) {
    $('#'+e.target.id)[0].style.background="url(../static/Cogito/img/icon-comment.svg) 0 1px no-repeat";
  }

  function bookmark(e) {
    $('#'+e.target.id)[0].style.background="url(../static/Cogito/img/icon-bookmark.svg) 0 1px no-repeat";
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

  function smoothScroll(e) {
    e.preventDefault();
    $(document).off("scroll");
    var target = this.hash,
        menu = target;
    console.log(this.hash);
    $top = $(target).offset().top;
    $('html, body').stop().animate({
        'scrollTop': $top - 40
    }, 0, 'swing', function () {
        window.location.hash = target;
        $(document).on("scroll", onScroll);
    });
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

  function resize() {
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }

  function onScroll() {
    if(navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav')
    }
    if(navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
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


  init();

});