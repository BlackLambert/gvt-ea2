const canvasID = "wgl-canvas";

const vertexShaderRaw = 
'attribute vec3 coordinates;' +
'void main(void) {' +
    'gl_Position = vec4(coordinates, 1.0);' +
'}';

const fragementShaderRaw = 
'void main(void) {' +
    ' gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);' +
'}';

// Translates the LSystem Rules to integer numbers
// Fl = 0
// Fr = 1
// + = 2
// - = 3
const lSystemRules = {
    Fl: [0, 0, 3, 1, 3, 1, 2, 0, 2, 0, 3, 1, 3, 1, 0, 2, 1, 2, 0, 0, 1, 3, 0, 2, 1, 2, 0, 0, 2, 1, 3, 0, 1, 3, 1, 3, 0, 2, 0, 2, 1, 1, 3],
    Fr: [2, 0, 0, 3, 1, 3, 1, 2, 0, 2, 0, 1, 2, 0, 3, 1, 1, 3, 0, 3, 1, 2, 0, 1, 1, 3, 0, 3, 1, 0, 2, 0, 2, 1, 3, 1, 3, 0, 2, 0, 2, 1, 1]
}

const iterrations = 2;
const directions = [[0,1,0],[1,0,0],[0,-1,0],[-1,0,0]];

let lSystem = [3, 1];

let vertices = null;
let indices = null

let canvas = document.getElementById(canvasID);
let gl = canvas.getContext('webgl', {antialias: false});

let vertexBuffer = null;
let intexBuffer = null
let colorBuffer = null;

let vertexShader = null;
let fragmentShader = null;
let program = null;
let coordinates = null;
let colors = null;

iterateLSystem();
createGeo();
initWGL();
draw();

function iterateLSystem()
{
    for(var i = 0; i < iterrations; i++)
    {
        lSystem = replaceLSystem(lSystem);
        
    }
    //console.log(lSystem);
}

function replaceLSystem(current)
{
    let newSystem = [];
    
    for(var i = 0; i < current.length; i++)
    {
        //console.log(current[i]);
        if(current[i] === 0)
        {
            newSystem = newSystem.concat(lSystemRules.Fl);
        }
        else if(current[i] === 1)
        {
            newSystem = newSystem.concat(lSystemRules.Fr);
        }
        else if(current[i] === 2)
        {
            newSystem.push(2);
        }
        else if(current[i] === 3)
        {
            newSystem.push(3);
        }
    }
    return newSystem;
}

function createGeo()
{
    let currentPosition = [1 - getDelta()/2,+ getDelta()/2,0];
    let direction = 0;
    let verticeIndex = 0;
    
    vertices = [];
    indices = [];

    for(var i = 0; i < lSystem.length; i++)
    {
        if(lSystem[i] === 0 || lSystem[i] === 1)
        {
            let dir = directions[direction];
            let deltaLength = getDelta();
            currentPosition = [
                currentPosition[0] + dir[0] * deltaLength,
                currentPosition[1] + dir[1] * deltaLength,
                currentPosition[2] + dir[2] * deltaLength];
            addVertice(currentPosition)
            indices.push(verticeIndex);
            verticeIndex += 1;
        }
        else if(lSystem[i] === 2)
        {
            direction = (direction + 1) % directions.length;
        }
        else if(lSystem[i] === 3)
        {
            direction = (direction - 1);
            if(direction < 0)
            {
                direction = directions.length + direction;
            }
        }
    }

    //console.log(vertices);
    //console.log(indices);
}

function getDelta()
{
    return 1.0/26;
}

function addVertice(coords)
{
    let x = coords[0]*2-1;
    let y = coords[1]*2-1;
    point = [x, y, 0];
    vertices = vertices.concat(point);
}


function initWGL()
{
    initBuffers();
    initShader();
    initProgram();
    combineShaderAndBuffer();
    initView();
}

function initBuffers()
{
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function initShader()
{
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderRaw);
    gl.compileShader(vertexShader);

    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragementShaderRaw);
    gl.compileShader(fragmentShader);
}

function initProgram()
{
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
}

function combineShaderAndBuffer()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    coordinates = gl.getAttribLocation(program, "coordinates");
    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordinates);
}

function initView()
{
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.00, 0.00, 0.00, 0.1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0,canvas.width,canvas.height);
}

function draw()
{
    gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT,0);
}