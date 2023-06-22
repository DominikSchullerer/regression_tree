let limitForSplitting = 20
let targetDepth = 3
let trainingDataProportion = 75
let functions = []
let minDefGlobal = 0
let maxDefGlobal = 0
let minValueGlobal = 0
let maxValueGlobal = 0
let dividedData = [[],[]]
let trainingData = []
let testData = []

prepare_canvas()

class constFunction {
    constructor(minDef, maxDef, value) {
        this.minDef = minDef
        this.maxDef = maxDef
        this.value = value
    }
}

class Leaf {
    constructor(decision, samples, minDef, maxDef) {
        this.decision = decision
        this.samples = samples
        this.sampleQuantity = samples.length
        this.minDef = minDef
        this.maxDef = maxDef

        functions.push(new constFunction(minDef, maxDef, decision))
    }
}

class Node {
    constructor(threshold, samples, smallChild, largeChild, minDef, maxDef) {
        this.threshold = threshold
        this.samples = samples
        this.sampleQuantity = samples.length
        this.smallChild = smallChild
        this.largeChild = largeChild
        this.minDef = minDef
        this.maxDef = maxDef
    }
}

function sortData(samples) {
    let sortedData = samples.sort(function (a, b) {
        let result = a[0] - b[0]
        return result
    })

    return sortedData
}

function getAverage(samples) {
    let decisions = []

    samples.forEach(sample => {
        decisions.push(sample.at(-1))
    })

    let sum = decisions.reduce((accumlator, currentValue) => {
        return accumlator + currentValue
    }, 0)

    return sum / (decisions.length)
}

function getSumOfSquaredResiduals(samples) {
    let average = getAverage(samples)
    let decisions = []

    samples.forEach(sample => {
        decisions.push(sample.at(-1))
    })

    let sumOfSquaredResiduals = decisions.reduce((accumulator, currentValue) => {
        return accumulator + (currentValue - average) ** 2
    }, 0)

    return sumOfSquaredResiduals
}

function getBestSplittingPoint(sortedSamples) {
    let bestSplittingPoint = undefined
    let smallestSumOfSquaredResiduals = undefined

    for (let index = 1; index < sortedSamples.length; index++) {
        let samllerSamples = sortedSamples.slice(0, index)
        let largerSamples = sortedSamples.slice(index)

        let sumOfSquaredResiduals = getSumOfSquaredResiduals(samllerSamples) + getSumOfSquaredResiduals(largerSamples)

        if (bestSplittingPoint == undefined || sumOfSquaredResiduals < smallestSumOfSquaredResiduals) {
            bestSplittingPoint = index
            smallestSumOfSquaredResiduals = sumOfSquaredResiduals
        }
    }

    return bestSplittingPoint
}

function regressionTree(samples, depth = 0, minDef = samples[0][0], maxDef = samples[samples.length - 1][0]) {
    if (depth >= targetDepth || samples.length == 1) {
        let decision = Math.round(getAverage(samples) * 100) / 100
        return new Leaf(decision, samples, minDef, maxDef)
    } else {
        let splittingPoint = getBestSplittingPoint(samples)
        let threshold = samples[splittingPoint][0]
        let smallerSamples = samples.slice(0, splittingPoint)
        let largerSamples = samples.slice(splittingPoint)
        let smallChild = regressionTree(smallerSamples, depth + 1, minDef, threshold)
        let largeChild = regressionTree(largerSamples, depth + 1, threshold, maxDef)
        return new Node(threshold, samples, smallChild, largeChild, minDef, maxDef)
    }
}

function treeToHtml(root) {
    const treeContainer = document.getElementById('treeContainer')
    let rootHTML = document.createElement('ul')
    rootHTML.classList.add('tree')
    if (root instanceof Node) {
        rootHTML.appendChild(getNodeHTML(root))
    } else if (root instanceof Leaf) {
        rootHTML.appendChild(getLeafHTML(root))
    }
    treeContainer.replaceChildren()
    treeContainer.appendChild(rootHTML)
}

function getNodeHTML(node) {
    let nodeHtml = document.createElement('li')
    let content = document.createElement('span')
    content.classList.add('node')

    let threshold = document.createElement('p')
    threshold.textContent = '<= ' + String(node.threshold) + '?'

    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(node.sampleQuantity)

    let defArea = document.createElement('p')
    defArea.textContent = 'Min: ' + String(node.minDef) + ', Max: ' + String(node.maxDef)

    content.appendChild(threshold)
    content.appendChild(sampleQuantity)
    content.appendChild(defArea)
    nodeHtml.appendChild(content)

    let children = document.createElement('ul')
    if (node.smallChild instanceof Node) {
        children.appendChild(getNodeHTML(node.smallChild))
    } else if (node.smallChild instanceof Leaf) {
        children.appendChild(getLeafHTML(node.smallChild))
    }

    if (node.largeChild instanceof Node) {
        children.appendChild(getNodeHTML(node.largeChild))
    } else if (node.largeChild instanceof Leaf) {
        children.appendChild(getLeafHTML(node.largeChild))
    }

    nodeHtml.appendChild(children)

    return nodeHtml
}

function getLeafHTML(leaf) {
    let leafHTML = document.createElement('li')
    let content = document.createElement('span')
    content.classList.add('leaf')

    let decision = document.createElement('p')
    decision.textContent = 'Getroffene Entscheidung: ' + String(leaf.decision)
    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(leaf.sampleQuantity)

    let defArea = document.createElement('p')
    defArea.textContent = 'Min: ' + String(leaf.minDef) + ', Max: ' + String(leaf.maxDef)

    content.appendChild(decision)
    content.appendChild(sampleQuantity)
    content.appendChild(defArea)

    leafHTML.appendChild(content)

    return leafHTML
}

function parseData() {
    let samples = []
    data.forEach(datum => {
        let sample = datum.split(',')
        let parsedSample = []

        sample.forEach(value => {
            parsedSample.push(parseFloat(value))
        });

        samples.push(parsedSample)

        minDefGlobal = Math.min(minDefGlobal, parsedSample[0])
        maxDefGlobal = Math.max(maxDefGlobal, parsedSample[0])
        minValueGlobal = Math.min(minValueGlobal, parsedSample[1])
        maxValueGlobal = Math.max(maxValueGlobal, parsedSample[1])
    });
    samples = sortData(samples)
    return samples
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
  

function divideData(samples, proportion) {
    let targetLength = samples.length * proportion
    let trainingData = []
    let testData = samples

    while (trainingData.length < targetLength) {
        let i = getRandomInt(samples.length)
        trainingData.push(testData.splice(i, 1)[0])
    }

    trainingData = sortData(trainingData)

    return [trainingData, testData]
}

let data = undefined
let file = document.getElementById('data')
file.addEventListener("change", function () {
    var reader = new FileReader()
    reader.onload = function () {
        data = this.result.split(/[\n\r]/)
        data = data.filter((str) => str != '').slice(1)
    }
    reader.readAsText(this.files[0])
});

let drawButton = document.getElementById('drawTree')
drawButton.addEventListener('click', function () {
    targetDepth = document.getElementById('targetDepthInput').value
    trainingDataProportion = document.getElementById('trainingDataProportion').value/100
    functions = []
    if (data != undefined) {
        let samples = parseData()

        dividedData = divideData(samples, trainingDataProportion)
        trainingData = dividedData[0]
        trainingData = sortData(trainingData)
        testData = dividedData[1]

        let tree = regressionTree(trainingData)

        treeToHtml(tree)

        prepare_canvas()

        functions.forEach(f => {
            draw_x_line(f.minDef, f.maxDef, f.value)
        });

        testData.forEach(datum => {
            draw_point(datum[0],datum[1])
        });
    }
})