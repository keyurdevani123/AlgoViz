from collections import deque, defaultdict

# Sorting Algorithms

def bubble_sort_steps(arr):
    """Generate step-by-step bubble sort visualization data"""
    steps = []
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            # Compare step
            steps.append({
                'type': 'compare',
                'array': arr.copy(),
                'comparing': [j, j + 1],
                'pseudocode_line': 'if arr[j] > arr[j+1]:',
                'description': f'Comparing {arr[j]} and {arr[j+1]}'
            })
            
            if arr[j] > arr[j + 1]:
                # Swap step
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                steps.append({
                    'type': 'swap',
                    'array': arr.copy(),
                    'swapped': [j, j + 1],
                    'pseudocode_line': 'swap(arr[j], arr[j+1])',
                    'description': f'Swapped {arr[j+1]} and {arr[j]}'
                })
    
    steps.append({
        'type': 'complete',
        'array': arr.copy(),
        'pseudocode_line': 'return arr',
        'description': 'Sorting complete!'
    })
    
    return steps

def selection_sort_steps(arr):
    """Generate step-by-step selection sort visualization data"""
    steps = []
    n = len(arr)
    
    for i in range(n):
        min_idx = i
        
        steps.append({
            'type': 'select_min',
            'array': arr.copy(),
            'current_min': min_idx,
            'pseudocode_line': f'min_idx = {i}',
            'description': f'Finding minimum from position {i}'
        })
        
        for j in range(i + 1, n):
            steps.append({
                'type': 'compare',
                'array': arr.copy(),
                'comparing': [min_idx, j],
                'current_min': min_idx,
                'pseudocode_line': 'if arr[j] < arr[min_idx]:',
                'description': f'Comparing {arr[j]} with current minimum {arr[min_idx]}'
            })
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                steps.append({
                    'type': 'new_min',
                    'array': arr.copy(),
                    'current_min': min_idx,
                    'pseudocode_line': f'min_idx = {j}',
                    'description': f'New minimum found: {arr[min_idx]}'
                })
        
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            steps.append({
                'type': 'swap',
                'array': arr.copy(),
                'swapped': [i, min_idx],
                'pseudocode_line': 'swap(arr[i], arr[min_idx])',
                'description': f'Swapped {arr[i]} with {arr[min_idx]}'
            })
    
    steps.append({
        'type': 'complete',
        'array': arr.copy(),
        'pseudocode_line': 'return arr',
        'description': 'Sorting complete!'
    })
    
    return steps

def insertion_sort_steps(arr):
    """Generate step-by-step insertion sort visualization data"""
    steps = []
    
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
        steps.append({
            'type': 'select_key',
            'array': arr.copy(),
            'key_index': i,
            'key_value': key,
            'pseudocode_line': f'key = arr[{i}] = {key}',
            'description': f'Inserting {key} into sorted portion'
        })
        
        while j >= 0 and arr[j] > key:
            steps.append({
                'type': 'compare',
                'array': arr.copy(),
                'comparing': [j, i],
                'key_value': key,
                'pseudocode_line': f'arr[{j}] > key',
                'description': f'{arr[j]} > {key}, shifting right'
            })
            
            arr[j + 1] = arr[j]
            steps.append({
                'type': 'shift',
                'array': arr.copy(),
                'shifted': j + 1,
                'key_value': key,
                'pseudocode_line': f'arr[{j+1}] = arr[{j}]',
                'description': f'Shifted {arr[j+1]} to position {j+1}'
            })
            j -= 1
        
        arr[j + 1] = key
        steps.append({
            'type': 'insert',
            'array': arr.copy(),
            'inserted': j + 1,
            'key_value': key,
            'pseudocode_line': f'arr[{j+1}] = key',
            'description': f'Inserted {key} at position {j+1}'
        })
    
    steps.append({
        'type': 'complete',
        'array': arr.copy(),
        'pseudocode_line': 'return arr',
        'description': 'Sorting complete!'
    })
    
    return steps

def merge_sort_steps(arr):
    """Generate step-by-step merge sort visualization data"""
    steps = []
    
    def merge_sort_recursive(arr, left, right, level=0):
        if left < right:
            mid = (left + right) // 2
            
            steps.append({
                'type': 'divide',
                'array': arr.copy(),
                'left': left,
                'right': right,
                'mid': mid,
                'level': level,
                'pseudocode_line': f'divide: [{left}...{mid}] and [{mid+1}...{right}]',
                'description': f'Dividing array at position {mid}'
            })
            
            merge_sort_recursive(arr, left, mid, level + 1)
            merge_sort_recursive(arr, mid + 1, right, level + 1)
            merge(arr, left, mid, right, level)
    
    def merge(arr, left, mid, right, level):
        left_arr = arr[left:mid + 1]
        right_arr = arr[mid + 1:right + 1]
        
        steps.append({
            'type': 'merge_start',
            'array': arr.copy(),
            'left': left,
            'right': right,
            'mid': mid,
            'level': level,
            'left_subarray': left_arr,
            'right_subarray': right_arr,
            'pseudocode_line': 'merge(left_arr, right_arr)',
            'description': f'Merging subarrays {left_arr} and {right_arr}'
        })
        
        i = j = 0
        k = left
        
        while i < len(left_arr) and j < len(right_arr):
            if left_arr[i] <= right_arr[j]:
                arr[k] = left_arr[i]
                i += 1
            else:
                arr[k] = right_arr[j]
                j += 1
            
            steps.append({
                'type': 'merge_step',
                'array': arr.copy(),
                'merged_index': k,
                'level': level,
                'pseudocode_line': f'arr[{k}] = {arr[k]}',
                'description': f'Placed {arr[k]} at position {k}'
            })
            k += 1
        
        while i < len(left_arr):
            arr[k] = left_arr[i]
            steps.append({
                'type': 'merge_step',
                'array': arr.copy(),
                'merged_index': k,
                'level': level,
                'pseudocode_line': f'arr[{k}] = {arr[k]}',
                'description': f'Copied remaining {arr[k]} to position {k}'
            })
            i += 1
            k += 1
        
        while j < len(right_arr):
            arr[k] = right_arr[j]
            steps.append({
                'type': 'merge_step',
                'array': arr.copy(),
                'merged_index': k,
                'level': level,
                'pseudocode_line': f'arr[{k}] = {arr[k]}',
                'description': f'Copied remaining {arr[k]} to position {k}'
            })
            j += 1
            k += 1
    
    merge_sort_recursive(arr, 0, len(arr) - 1)
    
    steps.append({
        'type': 'complete',
        'array': arr.copy(),
        'pseudocode_line': 'return arr',
        'description': 'Merge sort complete!'
    })
    
    return steps

def quick_sort_steps(arr):
    """Generate step-by-step quick sort visualization data"""
    steps = []
    
    def quick_sort_recursive(arr, low, high, level=0):
        if low < high:
            pi = partition(arr, low, high, level)
            quick_sort_recursive(arr, low, pi - 1, level + 1)
            quick_sort_recursive(arr, pi + 1, high, level + 1)
    
    def partition(arr, low, high, level):
        pivot = arr[high]
        steps.append({
            'type': 'select_pivot',
            'array': arr.copy(),
            'pivot_index': high,
            'pivot_value': pivot,
            'low': low,
            'high': high,
            'level': level,
            'pseudocode_line': f'pivot = arr[{high}] = {pivot}',
            'description': f'Selected pivot: {pivot}'
        })
        
        i = low - 1
        
        for j in range(low, high):
            steps.append({
                'type': 'compare',
                'array': arr.copy(),
                'comparing': [j, high],
                'pivot_value': pivot,
                'level': level,
                'pseudocode_line': f'if arr[{j}] <= pivot:',
                'description': f'Comparing {arr[j]} with pivot {pivot}'
            })
            
            if arr[j] <= pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    steps.append({
                        'type': 'swap',
                        'array': arr.copy(),
                        'swapped': [i, j],
                        'pivot_value': pivot,
                        'level': level,
                        'pseudocode_line': f'swap(arr[{i}], arr[{j}])',
                        'description': f'Swapped {arr[i]} and {arr[j]}'
                    })
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        steps.append({
            'type': 'pivot_place',
            'array': arr.copy(),
            'pivot_final_index': i + 1,
            'pivot_value': pivot,
            'level': level,
            'pseudocode_line': f'place pivot at position {i + 1}',
            'description': f'Placed pivot {pivot} at final position {i + 1}'
        })
        
        return i + 1
    
    quick_sort_recursive(arr, 0, len(arr) - 1)
    
    steps.append({
        'type': 'complete',
        'array': arr.copy(),
        'pseudocode_line': 'return arr',
        'description': 'Quick sort complete!'
    })
    
    return steps

def get_sorting_complexity(algorithm):
    """Return time and space complexity for sorting algorithms"""
    complexities = {
        'bubble': {'time_best': 'O(n)', 'time_avg': 'O(n²)', 'time_worst': 'O(n²)', 'space': 'O(1)'},
        'selection': {'time_best': 'O(n²)', 'time_avg': 'O(n²)', 'time_worst': 'O(n²)', 'space': 'O(1)'},
        'insertion': {'time_best': 'O(n)', 'time_avg': 'O(n²)', 'time_worst': 'O(n²)', 'space': 'O(1)'},
        'merge': {'time_best': 'O(n log n)', 'time_avg': 'O(n log n)', 'time_worst': 'O(n log n)', 'space': 'O(n)'},
        'quick': {'time_best': 'O(n log n)', 'time_avg': 'O(n log n)', 'time_worst': 'O(n²)', 'space': 'O(log n)'}
    }
    return complexities.get(algorithm, {})

# Tree Algorithms

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_binary_tree(nodes):
    """Build binary tree from array representation"""
    if not nodes or nodes[0] is None:
        return None
    
    root = TreeNode(nodes[0])
    queue = [root]
    i = 1
    
    while queue and i < len(nodes):
        node = queue.pop(0)
        
        if i < len(nodes) and nodes[i] is not None:
            node.left = TreeNode(nodes[i])
            queue.append(node.left)
        i += 1
        
        if i < len(nodes) and nodes[i] is not None:
            node.right = TreeNode(nodes[i])
            queue.append(node.right)
        i += 1
    
    return root

def inorder_traversal_steps(root):
    """Generate inorder traversal steps"""
    steps = []
    call_stack = []
    
    def inorder(node, depth=0):
        if not node:
            return
        
        call_stack.append(f"inorder({node.val})")
        steps.append({
            'type': 'visit',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'inorder({node.val})',
            'description': f'Visiting node {node.val}'
        })
        
        # Left subtree
        if node.left:
            steps.append({
                'type': 'go_left',
                'node': node.val,
                'next_node': node.left.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'inorder(node.left)',
                'description': f'Going to left child of {node.val}'
            })
            inorder(node.left, depth + 1)
        
        # Process current node
        steps.append({
            'type': 'process',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'process({node.val})',
            'description': f'Processing node {node.val}'
        })
        
        # Right subtree
        if node.right:
            steps.append({
                'type': 'go_right',
                'node': node.val,
                'next_node': node.right.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'inorder(node.right)',
                'description': f'Going to right child of {node.val}'
            })
            inorder(node.right, depth + 1)
        
        call_stack.pop()
        steps.append({
            'type': 'return',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'return from {node.val}',
            'description': f'Returning from node {node.val}'
        })
    
    inorder(root)
    return steps

def preorder_traversal_steps(root):
    """Generate preorder traversal steps"""
    steps = []
    call_stack = []
    
    def preorder(node, depth=0):
        if not node:
            return
        
        call_stack.append(f"preorder({node.val})")
        
        # Process current node first
        steps.append({
            'type': 'process',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'process({node.val})',
            'description': f'Processing node {node.val}'
        })
        
        # Left subtree
        if node.left:
            steps.append({
                'type': 'go_left',
                'node': node.val,
                'next_node': node.left.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'preorder(node.left)',
                'description': f'Going to left child of {node.val}'
            })
            preorder(node.left, depth + 1)
        
        # Right subtree
        if node.right:
            steps.append({
                'type': 'go_right',
                'node': node.val,
                'next_node': node.right.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'preorder(node.right)',
                'description': f'Going to right child of {node.val}'
            })
            preorder(node.right, depth + 1)
        
        call_stack.pop()
        steps.append({
            'type': 'return',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'return from {node.val}',
            'description': f'Returning from node {node.val}'
        })
    
    preorder(root)
    return steps

def postorder_traversal_steps(root):
    """Generate postorder traversal steps"""
    steps = []
    call_stack = []
    
    def postorder(node, depth=0):
        if not node:
            return
        
        call_stack.append(f"postorder({node.val})")
        steps.append({
            'type': 'visit',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'postorder({node.val})',
            'description': f'Visiting node {node.val}'
        })
        
        # Left subtree
        if node.left:
            steps.append({
                'type': 'go_left',
                'node': node.val,
                'next_node': node.left.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'postorder(node.left)',
                'description': f'Going to left child of {node.val}'
            })
            postorder(node.left, depth + 1)
        
        # Right subtree
        if node.right:
            steps.append({
                'type': 'go_right',
                'node': node.val,
                'next_node': node.right.val,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': 'postorder(node.right)',
                'description': f'Going to right child of {node.val}'
            })
            postorder(node.right, depth + 1)
        
        # Process current node last
        steps.append({
            'type': 'process',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'process({node.val})',
            'description': f'Processing node {node.val}'
        })
        
        call_stack.pop()
        steps.append({
            'type': 'return',
            'node': node.val,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'return from {node.val}',
            'description': f'Returning from node {node.val}'
        })
    
    postorder(root)
    return steps

# Recursion Algorithms

def factorial_steps(n):
    """Generate factorial recursion steps"""
    steps = []
    call_stack = []
    
    def factorial_recursive(n, depth=0):
        call_stack.append(f"factorial({n})")
        steps.append({
            'type': 'call',
            'n': n,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'factorial({n})',
            'description': f'Calculating factorial of {n}'
        })
        
        if n <= 1:
            result = 1
            steps.append({
                'type': 'base_case',
                'n': n,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return 1',
                'description': f'Base case: factorial({n}) = 1'
            })
        else:
            steps.append({
                'type': 'recursive_call',
                'n': n,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return {n} * factorial({n-1})',
                'description': f'Recursive call: {n} * factorial({n-1})'
            })
            
            sub_result = factorial_recursive(n - 1, depth + 1)
            result = n * sub_result
            
            steps.append({
                'type': 'return',
                'n': n,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return {n} * {sub_result} = {result}',
                'description': f'Returning: {n} * {sub_result} = {result}'
            })
        
        call_stack.pop()
        return result
    
    factorial_recursive(n)
    return steps

def fibonacci_steps(n):
    """Generate fibonacci recursion steps"""
    steps = []
    call_stack = []
    memo = {}
    
    def fib_recursive(n, depth=0):
        if n in memo:
            steps.append({
                'type': 'memoized',
                'n': n,
                'result': memo[n],
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return memo[{n}] = {memo[n]}',
                'description': f'Memoized: fib({n}) = {memo[n]}'
            })
            return memo[n]
        
        call_stack.append(f"fib({n})")
        steps.append({
            'type': 'call',
            'n': n,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f'fib({n})',
            'description': f'Calculating fibonacci of {n}'
        })
        
        if n <= 1:
            result = n
            steps.append({
                'type': 'base_case',
                'n': n,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return {n}',
                'description': f'Base case: fib({n}) = {n}'
            })
        else:
            steps.append({
                'type': 'recursive_call',
                'n': n,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return fib({n-1}) + fib({n-2})',
                'description': f'Recursive call: fib({n-1}) + fib({n-2})'
            })
            
            left = fib_recursive(n - 1, depth + 1)
            right = fib_recursive(n - 2, depth + 1)
            result = left + right
            
            steps.append({
                'type': 'return',
                'n': n,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f'return {left} + {right} = {result}',
                'description': f'Returning: {left} + {right} = {result}'
            })
        
        memo[n] = result
        call_stack.pop()
        return result
    
    fib_recursive(n)
    return steps

def tower_of_hanoi_steps(n):
    """Generate Tower of Hanoi recursion steps with disk tracking"""
    steps = []
    call_stack = []
    
    # Initialize rod states - A has all disks, B and C are empty
    rod_states = {
        'A': list(range(n, 0, -1)),  # [n, n-1, ..., 2, 1] (largest at bottom)
        'B': [],
        'C': []
    }
    
    def move_disk(source, destination):
        """Move one disk from source to destination"""
        if rod_states[source]:
            disk = rod_states[source].pop()
            rod_states[destination].append(disk)
            return disk
        return None
    
    def hanoi_recursive(n, source, destination, auxiliary, depth=0):
        call_stack.append(f"hanoi({n}, {source}, {destination}, {auxiliary})")
        steps.append({
            'type': 'call',
            'n': n,
            'source': source,
            'destination': destination,
            'auxiliary': auxiliary,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'rod_states': {k: v.copy() for k, v in rod_states.items()},
            'pseudocode_line': f'hanoi({n}, {source}, {destination}, {auxiliary})',
            'description': f'Move {n} disks from {source} to {destination} using {auxiliary}'
        })
        
        if n == 1:
            # Move the disk
            disk = move_disk(source, destination)
            steps.append({
                'type': 'move',
                'disk': disk,
                'source': source,
                'destination': destination,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'rod_states': {k: v.copy() for k, v in rod_states.items()},
                'pseudocode_line': f'move disk {disk} from {source} to {destination}',
                'description': f'Base case: Move disk {disk} from {source} to {destination}'
            })
        else:
            # Step 1: Move n-1 disks from source to auxiliary
            steps.append({
                'type': 'step1',
                'n': n,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'rod_states': {k: v.copy() for k, v in rod_states.items()},
                'pseudocode_line': f'hanoi({n-1}, {source}, {auxiliary}, {destination})',
                'description': f'Step 1: Move {n-1} disks from {source} to {auxiliary}'
            })
            hanoi_recursive(n - 1, source, auxiliary, destination, depth + 1)
            
            # Step 2: Move the nth disk from source to destination
            disk = move_disk(source, destination)
            steps.append({
                'type': 'step2',
                'disk': disk,
                'source': source,
                'destination': destination,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'rod_states': {k: v.copy() for k, v in rod_states.items()},
                'pseudocode_line': f'move disk {disk} from {source} to {destination}',
                'description': f'Step 2: Move disk {disk} from {source} to {destination}'
            })
            
            # Step 3: Move n-1 disks from auxiliary to destination
            steps.append({
                'type': 'step3',
                'n': n,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'rod_states': {k: v.copy() for k, v in rod_states.items()},
                'pseudocode_line': f'hanoi({n-1}, {auxiliary}, {destination}, {source})',
                'description': f'Step 3: Move {n-1} disks from {auxiliary} to {destination}'
            })
            hanoi_recursive(n - 1, auxiliary, destination, source, depth + 1)
        
        call_stack.pop()
        steps.append({
            'type': 'return',
            'n': n,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'rod_states': {k: v.copy() for k, v in rod_states.items()},
            'pseudocode_line': f'return from hanoi({n})',
            'description': f'Completed moving {n} disks'
        })
    
    # Initial state
    steps.append({
        'type': 'initial',
        'rod_states': {k: v.copy() for k, v in rod_states.items()},
        'pseudocode_line': 'Initial setup',
        'description': f'Initial setup: {n} disks on rod A'
    })
    
    hanoi_recursive(n, 'A', 'C', 'B')
    return steps

def reverse_string_steps(text):
    """Generate string reversal recursion steps"""
    steps = []
    call_stack = []
    
    def reverse_recursive(s, depth=0):
        call_stack.append(f"reverse('{s}')")
        steps.append({
            'type': 'call',
            'string': s,
            'call_stack': call_stack.copy(),
            'depth': depth,
            'pseudocode_line': f"reverse('{s}')",
            'description': f"Reversing string '{s}'"
        })
        
        if len(s) <= 1:
            result = s
            steps.append({
                'type': 'base_case',
                'string': s,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f"return '{s}'",
                'description': f"Base case: '{s}' is already reversed"
            })
        else:
            first_char = s[0]
            rest = s[1:]
            
            steps.append({
                'type': 'recursive_call',
                'string': s,
                'first_char': first_char,
                'rest': rest,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f"return reverse('{rest}') + '{first_char}'",
                'description': f"Split: '{first_char}' + reverse('{rest}')"
            })
            
            reversed_rest = reverse_recursive(rest, depth + 1)
            result = reversed_rest + first_char
            
            steps.append({
                'type': 'return',
                'string': s,
                'result': result,
                'call_stack': call_stack.copy(),
                'depth': depth,
                'pseudocode_line': f"return '{reversed_rest}' + '{first_char}' = '{result}'",
                'description': f"Returning: '{reversed_rest}' + '{first_char}' = '{result}'"
            })
        
        call_stack.pop()
        return result
    
    reverse_recursive(text)
    return steps

def get_recursion_complexity(algorithm):
    """Return time and space complexity for recursion algorithms"""
    complexities = {
        'factorial': {'time': 'O(n)', 'space': 'O(n)'},
        'fibonacci': {'time': 'O(2^n)', 'space': 'O(n)'},
        'tower': {'time': 'O(2^n)', 'space': 'O(n)'},
        'reverse': {'time': 'O(n)', 'space': 'O(n)'}
    }
    return complexities.get(algorithm, {})

# Graph Algorithms

def build_graph(nodes_count, edges):
    """Build adjacency list representation of graph"""
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)  # Undirected graph
    return graph

def bfs_steps(graph, start):
    """Generate BFS traversal steps"""
    steps = []
    visited = set()
    queue = deque([start])
    
    steps.append({
        'type': 'initialize',
        'queue': list(queue),
        'visited': list(visited),
        'current': None,
        'pseudocode_line': f'queue = [{start}], visited = []',
        'description': f'Initialize BFS with start node {start}'
    })
    
    while queue:
        current = queue.popleft()
        
        steps.append({
            'type': 'dequeue',
            'queue': list(queue),
            'visited': list(visited),
            'current': current,
            'pseudocode_line': f'current = queue.popleft() = {current}',
            'description': f'Dequeue node {current}'
        })
        
        if current not in visited:
            visited.add(current)
            
            steps.append({
                'type': 'visit',
                'queue': list(queue),
                'visited': list(visited),
                'current': current,
                'pseudocode_line': f'visited.add({current})',
                'description': f'Visit node {current}'
            })
            
            neighbors = graph[current]
            for neighbor in neighbors:
                if neighbor not in visited and neighbor not in queue:
                    queue.append(neighbor)
                    
                    steps.append({
                        'type': 'enqueue',
                        'queue': list(queue),
                        'visited': list(visited),
                        'current': current,
                        'neighbor': neighbor,
                        'pseudocode_line': f'queue.append({neighbor})',
                        'description': f'Enqueue neighbor {neighbor} of {current}'
                    })
    
    steps.append({
        'type': 'complete',
        'queue': list(queue),
        'visited': list(visited),
        'current': None,
        'pseudocode_line': 'BFS complete',
        'description': 'BFS traversal completed'
    })
    
    return steps

def dfs_steps(graph, start):
    """Generate DFS traversal steps"""
    steps = []
    visited = set()
    stack = [start]
    
    steps.append({
        'type': 'initialize',
        'stack': stack.copy(),
        'visited': list(visited),
        'current': None,
        'pseudocode_line': f'stack = [{start}], visited = []',
        'description': f'Initialize DFS with start node {start}'
    })
    
    while stack:
        current = stack.pop()
        
        steps.append({
            'type': 'pop',
            'stack': stack.copy(),
            'visited': list(visited),
            'current': current,
            'pseudocode_line': f'current = stack.pop() = {current}',
            'description': f'Pop node {current} from stack'
        })
        
        if current not in visited:
            visited.add(current)
            
            steps.append({
                'type': 'visit',
                'stack': stack.copy(),
                'visited': list(visited),
                'current': current,
                'pseudocode_line': f'visited.add({current})',
                'description': f'Visit node {current}'
            })
            
            neighbors = sorted(graph[current], reverse=True)  # Reverse for consistent order
            for neighbor in neighbors:
                if neighbor not in visited:
                    stack.append(neighbor)
                    
                    steps.append({
                        'type': 'push',
                        'stack': stack.copy(),
                        'visited': list(visited),
                        'current': current,
                        'neighbor': neighbor,
                        'pseudocode_line': f'stack.append({neighbor})',
                        'description': f'Push neighbor {neighbor} of {current} to stack'
                    })
    
    steps.append({
        'type': 'complete',
        'stack': stack.copy(),
        'visited': list(visited),
        'current': None,
        'pseudocode_line': 'DFS complete',
        'description': 'DFS traversal completed'
    })
    
    return steps
