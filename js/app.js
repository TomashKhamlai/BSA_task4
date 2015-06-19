var Application = {};//Глобальний об'єкт

//IIFE
(function(Application, $) {
    //Змінні для поглинання об'єктів середовища
    var 
    	_document, 
    	_$container,
    	//лічильник 
    	id = 0;

    //Інтерфейс підключення 
    Application.init = function() {
    	//Поглинання об'єктів середовища
        _document = document;
        _$container = $('#todo-container');
        $bbody = $('body');
        //Передача управління функції зворотнього зв'язку з середовищем
        this.addTaskContainer(_$container);

        $bbody.on('keypress keydown click','[data-role="page"]', $.proxy(this.onBackspace, this));  
    };

    //Функція зворотнього зв'язку з середовищем
    Application.addTaskContainer = function($baseNode) {
        var
        //Замість <header/>
            $headerElem = jQuery('<div/>', {
                'data-role': "header",
        //Тільки margin-top, але можна поприкрашати ще...
                'class': "list-header"
            }),
        //Заголовок    
            $heading = jQuery('<h1/>', {
                text: "Список товарів",
                'class': "heading1"
            }),
        //Заради переваг position: relative 
            $formHolder = jQuery('<div/>', {
                'class': "form-wraper"
            }),
        //Заради валідності
            $inputFieldsForm = jQuery('<form/>', {
                id: "input-container",
        //2 <input>-и разом jQ Mobile
                'data-role': "controlgroup",
                'data-type': "horizontal"
            }),
        //this вказує на Application
            id = this.nextId();
        //Заголовок у хедер-дів, а хедер-дів у контейнер
        $headerElem.append($heading);
        $baseNode.append($headerElem);
        //3 Кнопки
        $inputFieldsForm.append(jQuery('<input/>', {
        	//невід'ємні атрибути
            name: 'task',
            type: 'text',
            //type-field i jQ Mobile
            'class': 'type-field ui-btn ui-btn-inline',
            //селектор для (як розберуся то напишу обробники)
            //щоб спрацював клік або Enter необхідно мати data-action-type="submitInput",
            //котрий буде доданий після перевірки на !0 довжину за доп. onTypeIn
            'data-action': "typeIn",
            'data-submit-action': "submitInput",
            'data-focus-action': "getFocus",
            'data-press-action': "addTask",
            //селектор для ...
            'data-task-container-id': id,
            //без цього jQ Mobile дуже щедра на класи, а я на !important;
            'data-role': "none"
        }));
        $inputFieldsForm.append(jQuery('<input/>', {
            type: "button",
            //Напис
            value: "Add tasks",
            //селектор для ...
            'data-task-container-id': id,
            'data-click-action': "addTask",
            //add-item, disabled, як кнопка, не w:100%<-Tab, b - black
            'class': 'add-item ui-btn ui-btn-inline ui-btn-b disabled',
            /*disabled: 'disabled', після такого треба бути з JS "на ти"*/
            'data-role': "none"
        }));
        $controlGroupDiv = jQuery('<div/>', {
            'data-role': "controlgroup",
            'data-type': "horizontal",
            'id': "controlgroup-mini"

        });
        $controlGroupDiv.append(jQuery('<input/>', {
            type: "button",
            value: "Delete All Marked",
            //селектор для призначення кнопці події
            'data-action': "clearDone",
            //МОЖЛИВО ЗАЙВЕ, перевірити
            'data-task-container-id': id,
            //clear-btn
            'class': "ui-btn delete-done half-button",
        }));
        $controlGroupDiv.append(jQuery('<input/>', {
            type: "button",
            value: "Clear All Tasks",
            //селектор для призначення кнопці події
            'data-action': "clearTasks",
            //МОЖЛИВО ЗАЙВЕ, перевірити
            'data-task-container-id': id,
            //clear-allf
            'class': "clear-all ui-btn half-button",
        }));
        $inputFieldsForm.append($controlGroupDiv);


        $baseNode.append($formHolder.append($inputFieldsForm));
        $baseNode.append(jQuery('<ul/>', {'id': id}));
  
        $baseNode.on('focus','[data-focus-action="getFocus"]', $.proxy(this.onGetFocus, this));
        $baseNode.on('keyup','[data-action="typeIn"]', $.proxy(this.onTypeIn, this));
        $baseNode.on('keypress','[data-submit-action="submitInput"]', $.proxy(this.onSubmitInput, this));/*onKeyboardPress*/
        $baseNode.on('click','[data-click-action="addTask"]', $.proxy(this.onAddTask, this));
        // не працюЄ тому є хак(рядок 144), але хотілося би знати як правильно зробити 
        //$baseNode.on('press','[data-press-action="addTask"]', $.proxy(this.onAddTask, this));
        $baseNode.on('dblclick','label', $.proxy(this.editOnSelect, this));
        $baseNode.on('keydown focusout','[data-change-action="saveOrDiscardChanges"]', $.proxy(this.onSaveOrDiscardChanges, this));
        $baseNode.on('click','[data-action="removeTask"]', $.proxy(this.onTaskDelete, this));
        $baseNode.on('click','[data-action="clearTasks"]', $.proxy(this.onClearTasks, this));
        $baseNode.on('click','[data-state="doOrDone"]', $.proxy(this.onStateChange, this));
        $baseNode.on('click','[data-action="clearDone"]', $.proxy(this.onMarkedDelete, this));
	};

    //Лічильник ідентифікаторів
    Application.nextId = function() {
        return 'id-' + id++;
    };

	Application.onGetFocus = function() {
		if ($('.type-field').val().length === 0) {
			$('.add-item').addClass('disabled').removeAttr('data-click-action');
			$('.input-field').removeAttr('data-press-action');
		};
	};

    Application.onTypeIn = function(evt) {
        var
            $itemLen = $('.type-field').val().length;

        if ($itemLen === 0) {
            $('.add-item').addClass('disabled').removeAttr('data-click-action');
            //І щось від input.type-field потрібно забрати, щоб ентер не працював
            $('.type-field').removeAttr('data-press-action');
        } else {
            $('.add-item').removeClass('disabled').attr('data-click-action', "addTask");
            //І щось для input.type-field потрібно додати, щоб ентер запрацював
            $('.type-field').attr('data-press-action', "addTask");
        };
    };

    Application.onSubmitInput = function(evt) {
        if (evt.which === 13) {
            evt.preventDefault();
            if ($('.type-field').attr('data-press-action') === "addTask") {
            	this.onAddTask(evt);
        	};
        };        
    };

    Application.onAddTask = function(evt) {
        var 
            $taskContainer = $('#' + $(evt.target).attr('data-task-container-id')), 
            newTaskId = this.nextId(),
            $newTask = jQuery('<li/>', {id: newTaskId}),
            $itemName = $('.type-field').val();

        $newTask.append(jQuery('<input/>', {
            name: "state",
            type: "checkbox",
            'data-state': "doOrDone"
        }));
        $newTask.append(jQuery('<label/>', {
            name: "task",
            type: "text",
            'class': "task",
            text: $itemName,
            id: newTaskId
        }));
        $newTask.append($('<a href="#" class="destroy" data-action="removeTask" data-task-id="' + newTaskId + '"></a>'));
        
        $taskContainer.append($newTask);
        $('.type-field').val('').focus();
        
    };

    Application.onStateChange = function(evt) {
        var $labelTarget = ($(evt.target)).closest('li').find('label');
        $labelTarget.toggleClass('done');
    };

    Application.editOnSelect = function(evt) {
        evt.preventDefault();
        var
            idTemp = $(evt.target).attr('id');
            $labelToEdit = $('label#' + $(evt.target).attr('id'));
            $labelText = $labelToEdit.text(),
            $tempInput = jQuery('<input/>', {
                type: "text",
                value: "",
                'data-change-action': "saveOrDiscardChanges",
                id: "insertLabelEditInput",
                idKeeper: idTemp,
                dataText: $labelText
            });
            $labelToEdit.text('');
            $labelToEdit.after($tempInput);
            $('#insertLabelEditInput').focus().val($labelText);
    };

    Application.onSaveOrDiscardChanges = function(evt) {
        var
            backID, result, backData;
        function returnId() {
            return $('#insertLabelEditInput').attr('idKeeper');
        };
        function hideInput() {
            $('#insertLabelEditInput').remove();
        };
        backID = returnId();
        $backData = $('#insertLabelEditInput').attr('dataText');
        var
            fun13 = function() {
                $('#todo-container').off('focusout','[data-change-action="saveOrDiscardChanges"]', $.proxy(this.onSaveOrDiscardChanges, this));
                result = $('#insertLabelEditInput').val();
                $('label#' + backID).text(result);
                hideInput();
                $('#todo-container').on('focusout','[data-change-action="saveOrDiscardChanges"]', $.proxy(this.onSaveOrDiscardChanges, this));
            },
            fun27 = function() {
                $('#todo-container').off('focusout','[data-change-action="saveOrDiscardChanges"]', $.proxy(this.onSaveOrDiscardChanges, this));
                $('label#' + backID).text($backData);
                hideInput();
                $('#todo-container').on('focusout','[data-change-action="saveOrDiscardChanges"]', $.proxy(this.onSaveOrDiscardChanges, this));
            };
            focusout = function() {

                $('label#' + backID).text($backData);
                hideInput();
            };
        switch (evt.type) {
            case "keydown": switch(evt.which) {
                case 13: fun13();
                break;
                case 27: fun27();
                break;
            };
            break;
            case "focusout": focusout();
            break;
        };
    };
    
    Application.onTaskDelete = function(evt) {
        evt.preventDefault();
        $('#' + $(evt.target.parentNode).attr('id')).remove();
    };

    Application.onMarkedDelete = function(evt) {
            $('.done').each(function() {
                (this.parentNode).remove();
            })
    };
    
    Application.onClearTasks = function(evt) {
        $('#' + $(evt.target).attr('data-task-container-id')).empty();
    };

    Application.onBackspace = function(evt) {
    	if (evt.which === 8) {
            evt.stopPropagation();
        }; 
    };

})(Application, jQuery);