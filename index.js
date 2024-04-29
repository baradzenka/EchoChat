

const serviceUrl = "wss://echo-ws-service.herokuapp.com";


const inputMsg = document.querySelector(".chat .chat-control__msg-area textarea");
const btnSendMsg = document.querySelector(".chat .chat-control__msg-area button");
const btnSendLoc = document.querySelector(".chat .chat-control__geo-btn");

const divMsgListParent = document.querySelector(".chat .chat-content");
const divMsgList = document.querySelector(".chat .chat-content .msg-list");

const divBannerError = document.querySelector(".chat .banner-error");



let socket = new WebSocket(serviceUrl);

socket.onmessage = function(event)
{
	const msg = JSON.parse(event.data);
	if(msg &&
		msg.hasOwnProperty("type") && msg.type === "message" &&
		msg.hasOwnProperty("text") &&	typeof(msg.text) === "string")
	{
		AddResponseToLayout(msg.text);
	}
};
socket.onclose = function(event)
{
	let msg = (!event.wasClean && event.code===1006 ?
		"The connection was closed abnormally" : "The connection was closed") +
		`,  code = ${event.code}`;
	if(event.reason)
		msg += `,  reason = ${event.reason}`;

	ShowErrorBanner(msg);
	DisableChatControlArea();
};



inputMsg.onkeydown = (e) =>
{
	if(socket.readyState === 1/*OPEN*/)
		if(e.code==="Enter" && !e.shiftKey)
		{
			e.preventDefault();
			SendMessage();
		}
}
btnSendMsg.onclick = () =>
{
	if(socket.readyState === 1/*OPEN*/)
		SendMessage();
};
btnSendLoc.onclick = () =>
{
	if(socket.readyState === 1/*OPEN*/)
		SendLocation();
};



function SendMessage()
{
	if(inputMsg.value)
	{
		SendMessageToSocket("message", inputMsg.value);
		inputMsg.value = "";
	}
}
function SendLocation()
{
	if(!navigator.geolocation)
		SendMessageToSocket("location", "Geolocation is not supported by this browser");
	else	
	{
		navigator.geolocation.getCurrentPosition(
			position =>
			{
				const url = `http://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}`;
				const text = "Your current location is:\n" +
					`&nbsp;&nbsp;&nbsp;latitude: &nbsp;${position.coords.latitude}\n` +
					`&nbsp;&nbsp;&nbsp;longitude: &nbsp;${position.coords.longitude}\n\n` +
					`<a href="${url}" target="_blank">Show it on map</a>`;
				SendMessageToSocket("location", text);
			},
			error =>
				SendMessageToSocket("location", error.message)
		);
	}
}

function SendMessageToSocket(type, text)
{
	const msg = JSON.stringify({type, text});
	socket.send(msg);

	AddRrequestToLayout(text);
}



function AddRrequestToLayout(text)
{
	text = text.trimEnd().replaceAll("\n", "<br>");
	divMsgList.innerHTML +=
		`<div class="msg-list__request">
			<div class="msg-list__request-msg">${text}</div>
			<div class="msg-list__request-img"></div>
		</div>`;

	divMsgListParent.scrollTo(0, divMsgList.scrollHeight);   // scroll to the very end.
}
function AddResponseToLayout(text)
{
	text = text.trimEnd().replaceAll("\n", "<br>");
	divMsgList.innerHTML +=
		`<div class="msg-list__response">
			<div class="msg-list__response-img"></div>
			<div class="msg-list__response-msg">${text}</div>
		</div>`;

	divMsgListParent.scrollTo(0, divMsgList.scrollHeight);   // scroll to the very end.
}


function ShowErrorBanner(text)
{
	divBannerError.style.display = "block";
	divBannerError.textContent = text;
}

function DisableChatControlArea()
{
	inputMsg.disabled = true;
	btnSendMsg.disabled = true;
	btnSendLoc.disabled = true;
}

