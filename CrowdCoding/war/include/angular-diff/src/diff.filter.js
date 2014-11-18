'use strict';

angular.module('diff', [])
  .filter('diff', function ($sce) {

  /*
   * Javascript Diff Algorithm
   *  By John Resig (http://ejohn.org/)
   *  Modified by Chu Alan 'sprite'
   *
   * Released under the MIT license.
   *
   * More Info:
   *  http://ejohn.org/projects/javascript-diff-algorithm/
   */

  function escape(s) {
    var n = s;
    n = n.replace(/&/g, '&amp;');
    n = n.replace(/</g, '&lt;');
    n = n.replace(/>/g, '&gt;');
    n = n.replace(/'/g, '&quot;');

    return n;
  }

  function diffString( o, n ) {
    o = o.replace(/\s+$/, '');
    n = n.replace(/\s+$/, '');

    var out = diff(o === '' ? [] : o.split(/\s+/), n === '' ? [] : n.split(/\s+/) );
    var str = '';
    var i;

    var oSpace = o.match(/\s+/g);
    if (oSpace === null) {
      oSpace = ['\n'];
    } else {
      oSpace.push('\n');
    }
    var nSpace = n.match(/\s+/g);
    if (nSpace === null) {
      nSpace = ['\n'];
    } else {
      nSpace.push('\n');
    }

    if (out.n.length === 0) {
      for (i = 0; i < out.o.length; i++) {
        str += '<del>' + escape(out.o[i]) + oSpace[i] + '</del>';
      }
    } else {
      if (out.n[0].text === null) {
        for (n = 0; n < out.o.length && out.o[n].text === null; n++) {
          str += '<del>' + escape(out.o[n]) + oSpace[n] + '</del>';
        }
      }

      for (i = 0; i < out.n.length; i++ ) {
        if (!out.n[i].text) {
          str += '<ins>' + escape(out.n[i]) + nSpace[i] + '</ins>';
        } else {
          var pre = '';

          for (n = out.n[i].row + 1; n < out.o.length && !out.o[n].text; n++ ) {
            pre += '<del>' + escape(out.o[n]) + oSpace[n] + '</del>';
          }
          str += ' ' + out.n[i].text + nSpace[i] + pre;
        }
      }
    }

    return str;
  }

  function randomColor() {
    return 'rgb(' + (Math.random() * 100) + '%, ' +
                    (Math.random() * 100) + '%, ' +
                    (Math.random() * 100) + '%)';
  }

  function diffString2( o, n ) {
    var i;

    o = o.replace(/\s+$/, '');
    n = n.replace(/\s+$/, '');

    var out = diff(o === '' ? [] : o.split(/\s+/), n === '' ? [] : n.split(/\s+/) );

    var oSpace = o.match(/\s+/g);
    if (!oSpace) {
      oSpace = ['\n'];
    } else {
      oSpace.push('\n');
    }
    var nSpace = n.match(/\s+/g);
    if (!nSpace) {
      nSpace = ['\n'];
    } else {
      nSpace.push('\n');
    }

    var os = '';
    var colors = [];
    for (i = 0; i < out.o.length; i++) {
      colors[i] = randomColor();

      if (out.o[i].text) {
        os += '<span style="background-color: ' +colors[i]+ '">' +
              escape(out.o[i].text) + oSpace[i] + '</span>';
      } else {
        os += '<del>' + escape(out.o[i]) + oSpace[i] + '</del>';
      }
    }

    var ns = '';
    for (i = 0; i < out.n.length; i++) {
      if (out.n[i].text) {
        ns += '<span style="background-color: ' +colors[out.n[i].row]+ '">' +
              escape(out.n[i].text) + nSpace[i] + '</span>';
      } else {
        ns += '<ins>' + escape(out.n[i]) + nSpace[i] + '</ins>';
      }
    }

    return { o : os , n : ns };
  }

  function diff( o, n ) {
    var ns = {};
    var os = {};
    var i;

    for (i = 0; i < n.length; i++ ) {
      if ( !ns[ n[i] ] ) {
        ns[ n[i] ] = { rows: [], o: null };
      }
      ns[ n[i] ].rows.push( i );
    }

    for (i = 0; i < o.length; i++ ) {
      if ( !os[ o[i] ] ){
        os[ o[i] ] = { rows: [], n: null };
      }
      os[ o[i] ].rows.push( i );
    }

    for (i in ns ) {
      if ( ns[i].rows.length === 1 && typeof(os[i]) !== 'undefined' && os[i].rows.length === 1 ) {
        n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
        o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
      }
    }

    for (i = 0; i < n.length - 1; i++ ) {
      if ( n[i].text !== null && n[i+1].text === null && n[i].row + 1 < o.length && !o[ n[i].row + 1 ].text &&
           n[i+1] === o[ n[i].row + 1 ] ) {
        n[i+1] = { text: n[i+1], row: n[i].row + 1 };
        o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
      }
    }

    for (i = n.length - 1; i > 0; i-- ) {
      if ( n[i].text && !n[i-1].text && n[i].row > 0 && !o[ n[i].row - 1 ].text &&
           n[i-1] === o[ n[i].row - 1 ] ) {
        n[i-1] = { text: n[i-1], row: n[i].row - 1 };
        o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
      }
    }

    return { o: o, n: n };
  }

  // Actual filter
  return function(input, match) {
    return $sce.trustAsHtml(diffString(input, match));
  };
});
