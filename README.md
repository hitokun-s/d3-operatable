# d3-operatable.js

### About

d3-operatable.js is d3.js extension which can append GoogleMap-like operatability to a svg element.  
Operatability means,  
- left double click -> zoom in
- right double click -> zoom out
- wheeling -> zoom in/out
- mouse drag -> move

Zooming takes place around the mouse pointer.

### How to use

1. load d3-operatable.js after d3.js like this:  

   ```<script src='js/d3.min.js'></script>```  
   ```<script src='js/d3-operatable.js'></script>```

2. call magic spell like this:  
   ```
   d3.select("svg").operatable();
   ```

### Demo Site
[http://historip.com/playground/d3-operatable](http://historip.com/playground/d3-operatable)