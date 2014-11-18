'use strict';

describe('filter', function() {

  beforeEach(module('diff'));

  describe('checkmark', function() {

    it('should convert a string to the diff value with another string', inject(function(diffFilter) {
      expect(diffFilter(
        'The red brown fox jumped over the rolling log.',
        'The brown spotted fox leaped over the rolling log')
        .$$unwrapTrustedValue()).toBe(
        ' The <del>red </del> brown <ins>spotted </ins> fox <del>jumped </del><ins>leaped </ins> over  the  rolling <del>log.\n</del><ins>log\n</ins>');
    }));
  });
});
