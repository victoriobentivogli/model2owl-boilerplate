#!/usr/bin/env python3
"""
Example processing script for Jinja templates
This script processes examples and makes them available to Jinja templates
"""

import json
import os
import glob
from pathlib import Path

def process_examples_for_jinja(examples_dir):
    """Process examples and return data structure for Jinja templates"""
    examples_data = {}
    
    if not os.path.exists(examples_dir):
        print(f"Examples directory not found: {examples_dir}")
        return examples_data
    
    # Find all example files
    example_files = []
    for ext in ['*.jsonld', '*.json', '*.ttl', '*.turtle']:
        example_files.extend(glob.glob(os.path.join(examples_dir, ext)))
    
    for file_path in example_files:
        filename = os.path.basename(file_path)
        name, ext = os.path.splitext(filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if ext.lower() in ['.jsonld', '.json']:
                # Process JSON-LD
                try:
                    json_data = json.loads(content)
                    formatted_content = json.dumps(json_data, indent=2)
                    examples_data[name] = {
                        'name': name,
                        'filename': filename,
                        'type': 'jsonld',
                        'content': formatted_content,
                        'raw_content': content,
                        'valid': True
                    }
                except json.JSONDecodeError as e:
                    examples_data[name] = {
                        'name': name,
                        'filename': filename,
                        'type': 'jsonld',
                        'content': content,
                        'raw_content': content,
                        'valid': False,
                        'error': str(e)
                    }
            
            elif ext.lower() in ['.ttl', '.turtle']:
                # Process Turtle
                examples_data[name] = {
                    'name': name,
                    'filename': filename,
                    'type': 'turtle',
                    'content': content,
                    'raw_content': content,
                    'valid': True
                }
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            examples_data[name] = {
                'name': name,
                'filename': filename,
                'type': 'unknown',
                'content': '',
                'raw_content': '',
                'valid': False,
                'error': str(e)
            }
    
    return examples_data

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        examples_dir = sys.argv[1]
        data = process_examples_for_jinja(examples_dir)
        print(json.dumps(data, indent=2))
    else:
        print("Usage: python example_processing_jinja.py <examples_directory>")

