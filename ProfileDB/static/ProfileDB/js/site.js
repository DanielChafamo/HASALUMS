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
      slideshow = $('.main-content .slideshow'),
      crumOffsetTop = $crum.offset().top, 
      $document = $(document),
      toc = document.querySelector( '.leftsidebar' ),
      tocPath = document.querySelector( '.toc-marker path' ),
      liked =  null,
      created = null,
      bookmarked = null,
      TOP_MARGIN = 0.1,
      BOTTOM_MARGIN = 0.2, 
      slideshowDuration = 4000,
      pages = 7,
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
    $('a[href^="edit_"]').on('click', editProfile)
    $('a[href^="cancel_"]').on('click', cancelProfile)
    $('a[href^="submit_"]').on('click', submitProfile)
    $('button[id^="edit_"]').on('click', editForm)
    $('button[id^="like_"]').on('click', like)
    $('button[id^="comment_"]').on('click', comment)
    $('button[id^="bookmark_"]').on('click', bookmark)
    buildSnippets();
    markLikesBookmarks();
    showChangeButtons();
    drawPath(); 
    var timeout=setTimeout(function(){
      slideshowNext(slideshow,false,true);
    },slideshowDuration);
    slideshow.data('timeout',timeout);
    if($('.main-content .slideshow').length > 1) {
      $(window).on('scroll',homeSlideshowParallax);
    }
    $('#pagination').innerHTML = createPagination(pages, 2);
  }

  function editProfile(e) {
    e.preventDefault();   
    var target = e.currentTarget.href.split('_')[1]
    $('.'+target)[0].children[1].style.display="none"
    $('.'+target)[0].children[3].children[0].style.display="none"
    $('.'+target)[0].children[2].style.display="block"
    $('.'+target)[0].children[3].children[1].style.display="block"
    $('.'+target)[0].children[3].children[3].style.display="block"
  }

  function cancelProfile(e) {
    e.preventDefault();  
    var target = e.currentTarget.href.split('_')[1]
    $('.'+target)[0].children[1].style.display="block"
    $('.'+target)[0].children[3].children[0].style.display="block"
    $('.'+target)[0].children[2].style.display="none"
    $('.'+target)[0].children[3].children[1].style.display="none"
    $('.'+target)[0].children[3].children[3].style.display="none"
  }

  function submitProfile(e) {
    e.preventDefault();   
    var target = e.currentTarget.href.split('_')[1]
        key = $('.'+target)[0].children[2].children[0].name
        val = $('.'+target)[0].children[2].children[0].value
        fdict = {
          'first_name': $('.firstname')[0].children[1].innerHTML,
          'last_name': $('.lastname')[0].children[1].innerHTML,
          'username': $('.username')[0].children[1].innerHTML,
          'email': $('.email')[0].children[1].innerHTML,
          'contact_info': $('.contact')[0].children[1].innerHTML,
          'blurb': $('.blurb')[0].children[1].innerHTML,
          'location': $('.location')[0].children[1].innerHTML,
          'current_job': $('.currentjob')[0].children[1].innerHTML,
          'school': $('.school')[0].children[1].innerHTML,
          'year': $('.year')[0].children[1].innerHTML,
          'concentration': $('.concentration')[0].children[1].innerHTML,
        }
    fdict[key] = val
    console.log(fdict)
    $.ajax({
      url: '/ajax/update_profile/',
      method: 'POST',
      data: fdict,
      dataType: 'json',
      success: function (data) { 
        if (data["success"]) {
          $('.'+target)[0].children[1].innerHTML = val
          cancelProfile(e)
        } else if (data["error"]){
          console.log(data["error"]);
        }
      }
    });
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
            $('#postset').after($.parseHTML("{% autoescape off %}{% include 'ProfileDB/post_view.html' %}{% endautoescape off %}")[0]);
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
            "url(../static/ProfileDB/img/icon-heart.svg) 0 1px no-repeat";
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
      "url(../static/ProfileDB/img/icon-comment.svg) 0 1px no-repeat";
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
            "url(../static/ProfileDB/img/icon-bookmark.svg) 0 1px no-repeat";
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
    if(crumOffsetTop  < $window.scrollTop()+60 && !$body.hasClass('has-docked-crum')) {
      $body.addClass('has-docked-crum')
    }
    if(crumOffsetTop > $window.scrollTop()+60 && $body.hasClass('has-docked-crum')) {
      $body.removeClass('has-docked-crum')
    }

    // if(navOffsetTop  < $window.scrollTop()+15 && !$body.hasClass('has-docked-nav')) {
    //   $body.addClass('has-docked-nav')
    // }
    // if(navOffsetTop > $window.scrollTop()+15 && $body.hasClass('has-docked-nav')) {
    //   $body.removeClass('has-docked-nav')
    // }
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
    if (liked) {
      for (var i = liked.length - 1; i >= 0; i--) { 
        $('#like_'+liked[i])[0].style.background = 
          "url(../static/ProfileDB/img/icon-heart.svg) 0 1px no-repeat";
      }  
      for (var i = bookmarked.length - 1; i >= 0; i--) {
        $('#bookmark_'+bookmarked[i])[0].style.background = 
          "url(../static/ProfileDB/img/icon-bookmark.svg) 0 1px no-repeat";
      } 
    }
  }

  function showChangeButtons() {
    if (created) {
      for (var i = created.length - 1; i >= 0; i--) 
      $('#changes_'+created[i]).toggle();
    }
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

  function slideshowSwitch(slideshow,index,auto){
    if(slideshow.data('wait')) return;

    var slides = slideshow.find('.slide');
    var pages = slideshow.find('.pagination');
    var activeSlide = slides.filter('.is-active');
    var activeSlideImage = activeSlide.find('.image-container');
    var newSlide = slides.eq(index);
    var newSlideImage = newSlide.find('.image-container');
    var newSlideContent = newSlide.find('.slide-content');
    var newSlideElements=newSlide.find('.caption > *');
    if(newSlide.is(activeSlide))return;

    newSlide.addClass('is-new');
    var timeout=slideshow.data('timeout');
    clearTimeout(timeout);
    slideshow.data('wait',true);
    var transition=slideshow.attr('data-transition');
    if(transition=='fade'){
      newSlide.css({
        display:'block',
        zIndex:2
      });
      newSlideImage.css({
        opacity:0
      });

      TweenMax.to(newSlideImage,1,{
        alpha:1,
        onComplete:function(){
          newSlide.addClass('is-active').removeClass('is-new');
          activeSlide.removeClass('is-active');
          newSlide.css({display:'',zIndex:''});
          newSlideImage.css({opacity:''});
          slideshow.find('.pagination').trigger('check');
          slideshow.data('wait',false);
          if(auto){
            timeout=setTimeout(function(){
              slideshowNext(slideshow,false,true);
            },slideshowDuration);
            slideshow.data('timeout',timeout);}}});
    } else {
      if(newSlide.index()>activeSlide.index()){
        var newSlideRight=0;
        var newSlideLeft='auto';
        var newSlideImageRight=-slideshow.width()/8;
        var newSlideImageLeft='auto';
        var newSlideImageToRight=0;
        var newSlideImageToLeft='auto';
        var newSlideContentLeft='auto';
        var newSlideContentRight=0;
        var activeSlideImageLeft=-slideshow.width()/4;
      } else {
        var newSlideRight='';
        var newSlideLeft=0;
        var newSlideImageRight='auto';
        var newSlideImageLeft=-slideshow.width()/8;
        var newSlideImageToRight='';
        var newSlideImageToLeft=0;
        var newSlideContentLeft=0;
        var newSlideContentRight='auto';
        var activeSlideImageLeft=slideshow.width()/4;
      }

      newSlide.css({
        display:'block',
        width:0,
        right:newSlideRight,
        left:newSlideLeft
        ,zIndex:2
      });

      newSlideImage.css({
        width:slideshow.width(),
        right:newSlideImageRight,
        left:newSlideImageLeft
      });

      newSlideContent.css({
        width:slideshow.width(),
        left:newSlideContentLeft,
        right:newSlideContentRight
      });

      activeSlideImage.css({
        left:0
      });

      TweenMax.set(newSlideElements,{y:20,force3D:true});
      TweenMax.to(activeSlideImage,1,{
        left:activeSlideImageLeft,
        ease:Power3.easeInOut
      });

      TweenMax.to(newSlide,1,{
        width:slideshow.width(),
        ease:Power3.easeInOut
      });

      TweenMax.to(newSlideImage,1,{
        right:newSlideImageToRight,
        left:newSlideImageToLeft,
        ease:Power3.easeInOut
      });

      TweenMax.staggerFromTo(newSlideElements,0.8,{alpha:0,y:60},{alpha:1,y:0,ease:Power3.easeOut,force3D:true,delay:0.6},0.1,function(){
        newSlide.addClass('is-active').removeClass('is-new');
        activeSlide.removeClass('is-active');
        newSlide.css({
          display:'',
          width:'',
          left:'',
          zIndex:''
        });

        newSlideImage.css({
          width:'',
          right:'',
          left:''
        });

        newSlideContent.css({
          width:'',
          left:''
        });

        newSlideElements.css({
          opacity:'',
          transform:''
        });

        activeSlideImage.css({
          left:''
        });

        slideshow.find('.pagination').trigger('check');
        slideshow.data('wait',false);
        if(auto){
          timeout=setTimeout(function(){
            slideshowNext(slideshow,false,true);
          },slideshowDuration);
          slideshow.data('timeout',timeout);
        }
      });
    }
  }

  function slideshowNext(slideshow,previous,auto){
    var slides=slideshow.find('.slide');
    var activeSlide=slides.filter('.is-active');
    var newSlide=null;
    if(previous){
      newSlide=activeSlide.prev('.slide');
      if(newSlide.length === 0) {
        newSlide=slides.last();
      }
    } else {
      newSlide=activeSlide.next('.slide');
      if(newSlide.length==0)
        newSlide=slides.filter('.slide').first();
    }

    slideshowSwitch(slideshow,newSlide.index(),auto);
  }

  function homeSlideshowParallax(){
    var scrollTop=$(window).scrollTop();
    if(scrollTop>windowHeight) return;
    var inner=slideshow.find('.slideshow-inner');
    var newHeight=windowHeight-(scrollTop/2);
    var newTop=scrollTop*0.8;

    inner.css({
      transform:'translateY('+newTop+'px)',height:newHeight
    });
  }

  $('.slide').addClass('is-loaded');

  $('.slideshow .arrows .arrow').on('click',function(){
    slideshowNext($(this).closest('.slideshow'),$(this).hasClass('prev'));
  });

  $('.slideshow .pagination .item').on('click',function(){
    slideshowSwitch($(this).closest('.slideshow'),$(this).index());
  });

  $('.slideshow .pagination').on('check',function(){
    var slideshow=$(this).closest('.slideshow');
    var pages=$(this).find('.item');
    var index=slideshow.find('.slides .is-active').index();
    pages.removeClass('is-active');
    pages.eq(index).addClass('is-active');
  });
  
  function createPagination(pages, page) {
    let str = '<ul>';
    let active;
    let pageCutLow = page - 1;
    let pageCutHigh = page + 1; 
    if (page > 1) {
      str += '<li class="page-item previous no"><a onclick="createPagination(pages, '+(page-1)+')">&larr;</a></li>';
    } 
    if (pages < 6) {
      for (let p = 1; p <= pages; p++) {
        active = page == p ? "active" : "no";
        str += '<li class="'+active+'"><a onclick="createPagination(pages, '+p+')">'+ p +'</a></li>';
      }
    } 
    else { 
      if (page > 2) {
        str += '<li class="no page-item"><a onclick="createPagination(pages, 1)">1</a></li>';
        if (page > 3) {
            str += '<li class="out-of-range"><a onclick="createPagination(pages,'+(page-2)+')">...</a></li>';
        }
      } 
      if (page === 1) {
        pageCutHigh += 2;
      } else if (page === 2) {
        pageCutHigh += 1;
      } 
      if (page === pages) {
        pageCutLow -= 2;
      } else if (page === pages-1) {
        pageCutLow -= 1;
      } 
      for (let p = pageCutLow; p <= pageCutHigh; p++) {
        if (p === 0) {
          p += 1;
        }
        if (p > pages) {
          continue
        }
        active = page == p ? "active" : "no";
        str += '<li class="page-item '+active+'"><a onclick="createPagination(pages, '+p+')">'+ p +'</a></li>';
      } 
      if (page < pages-1) {
        if (page < pages-2) {
          str += '<li class="out-of-range"><a onclick="createPagination(pages,'+(page+2)+')">...</a></li>';
        }
        str += '<li class="page-item no"><a onclick="createPagination(pages, pages)">'+pages+'</a></li>';
      }
    } 
    if (page < pages) {
      str += '<li class="page-item next no"><a onclick="createPagination(pages, '+(page+1)+')">&rarr;</a></li>';
    }
    str += '</ul>'; 
    document.getElementById('pagination').innerHTML = str;
    return str;
  }

  init();

});