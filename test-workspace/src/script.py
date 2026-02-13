#!/usr/bin/env python3
"""Test script for debugging with command line arguments."""

import sys


def main():
    print("=== Script Arguments Test ===")
    print(f"Script name: {sys.argv[0]}")
    print(f"Arguments count: {len(sys.argv) - 1}")

    if len(sys.argv) > 1:
        print("\nArguments passed:")
        for i, arg in enumerate(sys.argv[1:], 1):
            print(f"  [{i}] {arg}")
    else:
        print("\nNo arguments passed.")

    print("\n=== Test Complete ===")


if __name__ == "__main__":
    main()
