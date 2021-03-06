'use strict';

var should = require('chai').should();

var ip = require('..');

var Address4 = ip.Address4;
var Address6 = ip.Address6;

var valid4 = require('./data/valid-ipv4-addresses.json');
var valid6 = require('./data/valid-ipv6-addresses.json');

var invalid4 = require('./data/invalid-ipv4-addresses.json');
var invalid6 = require('./data/invalid-ipv6-addresses.json');

function addressIs(addressString, descriptors) {
  var address4 = new Address4(addressString);
  var address6 = new Address6(addressString);

  describe(addressString, function () {
    descriptors.forEach(function (descriptor) {
      if (descriptor === 'valid-ipv4') {
        it('is valid', function () {
          address4.should.be.an('object');

          address4.parsedAddress.should.be.an.instanceOf(Array);
          address4.parsedAddress.length.should.equal(4);

          address4.subnetMask.should.be.a('number');

          address4.subnetMask.should.be.at.least(0);
          address4.subnetMask.should.be.at.most(128);

          should.not.exist(address4.error);
          should.not.exist(address4.parseError);

          address4.isValid().should.equal(true);
        });
      }

      if (descriptor === 'valid-ipv6') {
        it('is valid', function () {
          address6.should.be.an('object');

          address6.zone.should.be.a('string');

          address6.subnet.should.be.a('string');

          address6.subnetMask.should.be.a('number');

          address6.subnetMask.should.be.at.least(0);
          address6.subnetMask.should.be.at.most(128);

          address6.parsedAddress.should.be.an.instanceOf(Array);
          address6.parsedAddress.length.should.equal(8);

          should.not.exist(address6.error);
          should.not.exist(address6.parseError);

          address6.isValid().should.equal(true);
        });

        var re = address6.regularExpression();
        var reSubstring = address6.regularExpression(true);

        it('matches the correct form via regex', function () {
          re.test(address6.correctForm()).should.equal(true);
          reSubstring.test('abc ' + address6.correctForm() + ' def')
            .should.equal(true);
        });

        it('matches the canonical form via regex', function () {
          re.test(address6.canonicalForm()).should.equal(true);
          reSubstring.test('abc ' + address6.canonicalForm() + ' def')
            .should.equal(true);
        });

        it('matches the given form via regex', function () {
          // We can't match addresses like ::192.168.0.1 yet
          if (address6.is4()) {
            return;
          }

          re.test(addressString).should.equal(true);
          reSubstring.test('abc ' + addressString + ' def')
            .should.equal(true);
        });

        it('converts to a byte array and back', function () {
          var byteArray = address6.toByteArray();

          byteArray.length.should.be.at.most(16);

          var converted = Address6.fromByteArray(byteArray);

          address6.correctForm().should.equal(converted.correctForm());
        });

        it('converts to an unsigned byte array and back', function () {
          var byteArray = address6.toUnsignedByteArray();

          byteArray.length.should.be.at.most(16);

          var converted = Address6.fromUnsignedByteArray(byteArray);

          address6.correctForm().should.equal(converted.correctForm());
        });
      }

      if (descriptor === 'invalid-ipv4') {
        it('is invalid as parsed by v4', function () {
          address4.error.should.be.a('string');

          address4.isValid().should.equal(false);
        });
      }

      if (descriptor === 'invalid-ipv6') {
        it('is invalid as parsed by v6', function () {
          address6.error.should.be.a('string');

          address6.isValid().should.equal(false);
          should.not.exist(address6.correctForm());
        });
      }

      if (descriptor === 'canonical') {
        it('is canonical', function () {
          address6.isCanonical().should.equal(true);

          should.equal(address6.addressMinusSuffix.length, 39);
        });
      }

      if (descriptor === 'correct') {
        it('is correct', function () {
          address6.isCorrect().should.equal(true);
        });
      }

      if (descriptor === 'correct-ipv4') {
        it('is correct', function () {
          address4.isCorrect().should.equal(true);
        });
      }

      if (descriptor === 'incorrect') {
        it('is incorrect', function () {
          address6.isCorrect().should.equal(false);
        });
      }

      if (descriptor === 'incorrect-ipv4') {
        it('is incorrect', function () {
          address4.isCorrect().should.equal(false);
        });
      }

      if (descriptor === 'has-subnet') {
        it('parses the subnet', function () {
          address6.subnet.should.match(/^\/\d{1,3}/);
        });
      }

      if (descriptor === 'v4-in-v6') {
        it('is an ipv4-in-ipv6 address', function () {
          address6.is4().should.equal(true);
        });
      }
    });
  });
}

function loadJsonBatch(addresses, classes, noMerge) {
  addresses.forEach(function (address) {
    if (address.conditions === undefined ||
      !address.conditions.length || noMerge) {
      address.conditions = classes;
    } else {
      address.conditions = address.conditions.concat(classes);
    }

    addressIs(address.address, address.conditions);
  });
}

describe('Valid IPv4 addresses', function () {
  loadJsonBatch(valid4, ['valid-ipv4']);
  loadJsonBatch(valid4, ['invalid-ipv6'], true);
});

describe('Valid IPv6 addresses', function () {
  loadJsonBatch(valid6, ['valid-ipv6']);
  loadJsonBatch(valid6, ['invalid-ipv4'], true);
});

describe('Invalid IPv4 addresses', function () {
  loadJsonBatch(invalid4, ['invalid-ipv4']);
});

describe('Invalid IPv6 addresses', function () {
  loadJsonBatch(invalid6, ['invalid-ipv6']);
});
