from flask import render_template, jsonify, request
from app import app
from algorithms import *

@app.route('/')
def index():
    """Main landing page with algorithm categories"""
    return render_template('index.html')

@app.route('/sorting')
def sorting():
    """Sorting algorithms visualizer page"""
    return render_template('sorting.html')

@app.route('/trees')
def trees():
    """Tree traversal visualizer page"""
    return render_template('trees.html')

@app.route('/recursion')
def recursion():
    """Recursion algorithms visualizer page"""
    return render_template('recursion.html')

@app.route('/graphs')
def graphs():
    """Graph traversal visualizer page"""
    return render_template('graphs.html')

@app.route('/api/sort/<algorithm>')
def get_sorting_steps(algorithm):
    """API endpoint to get sorting algorithm steps"""
    data = request.args.get('data', '64,34,25,12,22,11,90')
    arr = [int(x.strip()) for x in data.split(',')]
    
    if algorithm == 'bubble':
        steps = bubble_sort_steps(arr.copy())
    elif algorithm == 'selection':
        steps = selection_sort_steps(arr.copy())
    elif algorithm == 'insertion':
        steps = insertion_sort_steps(arr.copy())
    elif algorithm == 'merge':
        steps = merge_sort_steps(arr.copy())
    elif algorithm == 'quick':
        steps = quick_sort_steps(arr.copy())
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({
        'steps': steps,
        'complexity': get_sorting_complexity(algorithm)
    })

@app.route('/api/tree/traversal/<traversal_type>')
def get_tree_traversal(traversal_type):
    """API endpoint to get tree traversal steps"""
    tree_data = request.args.get('tree', '1,2,3,4,5,6,7')
    nodes = [int(x.strip()) if x.strip() != 'null' else None for x in tree_data.split(',')]
    
    tree = build_binary_tree(nodes)
    
    if traversal_type == 'inorder':
        steps = inorder_traversal_steps(tree)
    elif traversal_type == 'preorder':
        steps = preorder_traversal_steps(tree)
    elif traversal_type == 'postorder':
        steps = postorder_traversal_steps(tree)
    else:
        return jsonify({'error': 'Unknown traversal type'}), 400
    
    return jsonify({
        'steps': steps,
        'complexity': {'time': 'O(n)', 'space': 'O(h)'}
    })

@app.route('/api/recursion/<algorithm>')
def get_recursion_steps(algorithm):
    """API endpoint to get recursion algorithm steps"""
    if algorithm == 'factorial':
        n = int(request.args.get('n', 5))
        steps = factorial_steps(n)
    elif algorithm == 'fibonacci':
        n = int(request.args.get('n', 5))
        steps = fibonacci_steps(n)
    elif algorithm == 'tower':
        n = int(request.args.get('n', 3))
        steps = tower_of_hanoi_steps(n)
    elif algorithm == 'reverse':
        text = request.args.get('text', 'hello')
        steps = reverse_string_steps(text)
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({
        'steps': steps,
        'complexity': get_recursion_complexity(algorithm)
    })

@app.route('/api/graph/<algorithm>')
def get_graph_traversal(algorithm):
    """API endpoint to get graph traversal steps"""
    # Expected format: "0-1,0-2,1-3,2-3" for edges
    edges_data = request.args.get('edges', '0-1,0-2,1-3,2-3')
    nodes_count = int(request.args.get('nodes', 4))
    start_node = int(request.args.get('start', 0))
    
    edges = []
    if edges_data:
        for edge in edges_data.split(','):
            if '-' in edge:
                u, v = map(int, edge.split('-'))
                edges.append((u, v))
    
    graph = build_graph(nodes_count, edges)
    
    if algorithm == 'bfs':
        steps = bfs_steps(graph, start_node)
    elif algorithm == 'dfs':
        steps = dfs_steps(graph, start_node)
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({
        'steps': steps,
        'complexity': {'time': 'O(V + E)', 'space': 'O(V)'}
    })
