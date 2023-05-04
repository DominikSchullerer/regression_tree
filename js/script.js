let limitForSplitting = 20

class Leaf {
    constructor(decision, samples) {
        this.decision = decision
        this.samples = samples
        this.sampleQuantity = samples.length
    }
}

class Node {
    constructor(threshold, samples, smallChild, largeChild) {
        this.threshold = threshold
        this.samples = samples
        this.sampleQuantity = samples.length
        this.smallChild = smallChild
        this.largeChild = largeChild
    }
}

function sortData(samples) {
    let sortedData = samples.sort(function(a,b) {
        return a[0] - b[0]
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

    return sum/(decisions.length)
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

        let sumOfSquaredResiduals = getSumOfSquaredResiduals(samllerSamples) + getSumOfSquaredResiduals (largerSamples)

        if (bestSplittingPoint == undefined || sumOfSquaredResiduals < smallestSumOfSquaredResiduals) {
            bestSplittingPoint = index 
            smallestSumOfSquaredResiduals = sumOfSquaredResiduals
        }
    }

    return bestSplittingPoint
}

function regressionTree(samples) {
    samples = sortData(samples)

    if (samples.length < limitForSplitting) {
        let decision = getAverage(samples)
        return new Leaf(decision, samples)
    } else {
        let splittingPoint = getBestSplittingPoint(samples)
        let threshold = samples[splittingPoint][0]
        let smallerSamples = samples.slice(0, splittingPoint)
        let largerSamples = samples.slice(splittingPoint)
        let smallChild = regressionTree(smallerSamples)
        let largeChild = regressionTree(largerSamples)
        return new Node(threshold, samples, smallChild, largeChild)
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
    threshold.textContent = '< ' + String(node.threshold)

    let sampleQuantity = document.createElement('p')
    sampleQuantity.textContent = 'Anzahl der Trainingsdaten: ' + String(node.sampleQuantity)

    content.appendChild(threshold)
    content.appendChild(sampleQuantity)
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
    
    content.appendChild(decision)
    content.appendChild(sampleQuantity)

    leafHTML.appendChild(content)

    return leafHTML
}

let file = document.getElementById('data')
let data = undefined

file.addEventListener("change", function () {
    var reader = new FileReader()
    reader.onload = function() {
    data = this.result.split(/[\n\r]/)
    data = data.filter((str) => str != '')
      }
    reader.readAsText(this.files[0])
});

let drawButton = document.getElementById('drawTree')
drawButton.addEventListener('click', function() {
    if (data != undefined) {
        let samples = []
        data.forEach(datum => {
            let sample = datum.split(',')
            let parsedSample = []

            sample.forEach(value => {
                parsedSample.push(parseFloat(value))
            });

            samples.push(parsedSample)
        });

        let tree = regressionTree(samples)
        treeToHtml(tree)
    }
})