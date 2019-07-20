

const vDiff = (target, source) => {
    const worker = {
        settings: {
            original: target,
        },
        replace(target, source = target) {
            const v = document.createElement('template');
            v.innerHTML = source;
            const vHTML = v.content.firstChild.nextElementSibling;
            if (vHTML.nodeName !== target.nodeName) {
                target.parentElement.replaceChild(vHTML, target);
                return;
            }
            this.iterate(target, vHTML);
        },
        iterate(targetNode, sourceNode, tOriginal) {
            if (targetNode || sourceNode) {
                this.checkAdditions(targetNode, sourceNode, tOriginal);
                if (targetNode && sourceNode && targetNode.nodeName !== sourceNode.nodeName) {
                    this.checkNodeName(targetNode, sourceNode);
                } else if (targetNode && sourceNode && targetNode.nodeName === sourceNode.nodeName) {
                    this.checkTextContent(targetNode, sourceNode);
                    targetNode.nodeType !== 3 && target.nodeType !== 8 && this.checkAttributes(targetNode, sourceNode);
                }
            }
            if (targetNode && sourceNode) {
                if (targetNode.childNodes && sourceNode.childNodes) {
                    this.settings.lengthDifferentiator = [...target.childNodes, ...sourceNode.childNodes];
                } else {
                    this.settings.lengthDifferentiator = null;
                }
                Array.apply(null, this.settings.lengthDifferentiator).forEach((node, idx) => {
                    this.settings.lengthDifferentiator && this.iterate(targetNode.childNodes[idx], sourceNode.childNodes[idx], targetNode, sourceNode);
                });
            }
        },
        checkNodeName(targetNode, sourceNode) {
            const n = sourceNode.cloneNode(true);
            targetNode.parentElement.replaceChild(n, targetNode);
        },
        checkAttributes(targetNode, sourceNode) {

            const attributes = targetNode.attributes || [];

            const filteredAttrs = Object.keys(attributes).map((n) => attributes[n]);

            const attributesNew = sourceNode.attributes || [];

            const filteredAttrsNew = Object.keys(attributesNew).map((n) => attributesNew[n]);

            filteredAttrs.forEach(o => {
                return sourceNode.getAttribute(o.name) !== null ? targetNode.setAttribute(o.name, sourceNode.getAttribute(o.name)) : targetNode.removeAttribute(o.name);
            });
            filteredAttrsNew.forEach(a => {
                return targetNode.getAttribute(a.name) !== sourceNode.getAttribute(a.name) && targetNode.setAttribute(a.name, sourceNode.getAttribute(a.name));
            });
        },
        checkTextContent(targetNode, sourceNode) {
            if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.textContent = sourceNode.textContent;
            }
        },
        checkAdditions(targetNode, sourceNode, tParent = this.settings.original) {
            if (sourceNode && targetNode === undefined) {
                const newNode = sourceNode.cloneNode(true);
                tParent.nodeType !== 3 && tParent.nodeType !== 8 && tParent.appendChild(newNode);
            } else if (targetNode && sourceNode === undefined) {
                targetNode.parentElement.removeChild(targetNode);
            }
        }
    };
    Object.create(worker).replace(target, source);
};
///////////////////////////////////////

const state = {
    itemCounter: 0,
    toDoItems: [],
    filterSelect: 'all',
    allChecked: false,
};

function encodeInput(v) {
    return v.replace(/[\"&<>\']/g, function (a) {
        return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": "\'"  }[a];
    });
}

function filterBy(filter) {
    state.toDoItems.forEach(i => {
        if (filter === 'all') {
            i.visible = true;
        } else if (filter === 'completed') {
            i.visible = i.checked;
        } else {
            i.visible = !i.checked;
        }
    });
    state.filterSelect = filter;
    buildApp(state);
}

function addToDo(self) {
    state.toDoItems.push({
        val: self.value,
        label: encodeInput(self.value),
        id: state.itemCounter++,
        checked: false,
        visible: state.filterSelect !== 'completed',
    });
    self.value = '';
    buildApp(state);
}

function checkToDo(id) {
    state.toDoItems.forEach(i => {
        if (i.id === id) {
            i.checked = !i.checked;
            i.visible = (i.checked === true && state.filterSelect !== 'active') || (i.checked === false && state.filterSelect !== 'completed');
        }
    });
    buildApp(state);
}

function removeToDo(id) {
    const newToDos = state.toDoItems.filter(i => i.id !== id);
    state.toDoItems = newToDos;
    buildApp(state);
}

function toggleCheckAll() {
    state.allChecked = !state.allChecked;
    state.toDoItems.forEach(i => {
        i.checked = state.allChecked;
        i.visible = (state.allChecked && state.filterSelect !== 'active') || (state.allChecked === false && state.filterSelect !== 'completed');
    });
    buildApp(state);
}

function editToDo(val, id) {
    state.toDoItems.some(i => {
        if (i.id === id && val.innerText !== i.val) {
            i.val = val.innerText;
            i.label = encodeInput(val.innerText);
            buildApp(state);
            return true;
        }
        return false;
    });
}

function buildApp(newState = state) {
    const appString = `
		<section id="my-app">
			<div class="todo">
				<h1>todos</h1>
				<div class="posRel">
					<span onclick="toggleCheckAll()" class="${state.toDoItems.length ? 'toggleAll' : 'hidden'}">❯</span>
					<input type="text" placeholder="What needs to be done?" onchange="addToDo(this)" />
                </div>
				<div class="list-container">
      			  ${newState.toDoItems.map(v => `
					<div class="${v.checked ? 'itemChecked' : ''} ${v.visible ? '' : 'hidden'} item">
						<div class="${v.checked ? 'isChecked' : ''} check" onClick="checkToDo(${v.id})"></div>
						<svg onclick="removeToDo(${v.id})" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
							<path d="M3 6v18h18V6H3zm5 14a1 1 0 0 1-2 0V10a1 1 0 0 1 2 0v10zm5 0a1 1 0 0 1-2 0V10a1 1 0 0 1 2 0v10zm5 0a1 1 0 0 1-2 0V10a1 1 0 0 1 2 0v10zm4-18v2H2V2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2H22z"/>
						</svg>
						<span contenteditable onblur="editToDo(this, ${v.id})">${v.label}</span>
					</div>
				  `).join('')}
					${newState.toDoItems.length ? `
					<div class="filter">
						<p>${newState.toDoItems.filter(i => !i.checked).length} Items left</p>
						<button onclick="filterBy('all')" class="${state.filterSelect === 'all' ? 'selected' : ''}">All</button>
						<button onclick="filterBy('active')" class="${state.filterSelect === 'active' ? 'selected' : ''}">Active</button>
						<button onclick="filterBy('completed')" class="${state.filterSelect === 'completed' ? 'selected' : ''}">Completed</button>
					</div>
					` : ''}
				</div>
			</div>
		</section>
	`;

    vDiff(document.querySelector('#my-app'), appString);
}

buildApp();