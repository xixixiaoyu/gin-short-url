package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncodeBase62(t *testing.T) {
	tests := []struct {
		input    uint64
		expected string
	}{
		{0, "0"},
		{1, "1"},
		{10, "a"},
		{35, "z"},
		{36, "A"},
		{61, "Z"},
		{62, "10"},
		{123, "1Z"},
		{3844, "100"}, // 62^2
	}

	for _, test := range tests {
		result := EncodeBase62(test.input)
		assert.Equal(t, test.expected, result, "EncodeBase62(%d) should return %s", test.input, test.expected)
	}
}

func TestDecodeBase62(t *testing.T) {
	tests := []struct {
		input    string
		expected uint64
	}{
		{"0", 0},
		{"1", 1},
		{"a", 10},
		{"z", 35},
		{"A", 36},
		{"Z", 61},
		{"10", 62},
		{"1Z", 123},
		{"100", 3844},
	}

	for _, test := range tests {
		result := DecodeBase62(test.input)
		assert.Equal(t, test.expected, result, "DecodeBase62(%s) should return %d", test.input, test.expected)
	}
}

func TestBase62RoundTrip(t *testing.T) {
	testValues := []uint64{0, 1, 10, 62, 123, 1000, 3844, 999999}

	for _, value := range testValues {
		encoded := EncodeBase62(value)
		decoded := DecodeBase62(encoded)
		assert.Equal(t, value, decoded, "Round trip failed for value %d", value)
	}
}

func TestIsValidBase62(t *testing.T) {
	validCases := []string{
		"0", "1", "a", "z", "A", "Z", "10", "1Z", "abc123XYZ",
	}

	for _, test := range validCases {
		assert.True(t, IsValidBase62(test), "%s should be valid Base62", test)
	}

	invalidCases := []string{
		"", "!", "@", "#", "abc!", "123@", "test-case",
	}

	for _, test := range invalidCases {
		assert.False(t, IsValidBase62(test), "%s should be invalid Base62", test)
	}
}
