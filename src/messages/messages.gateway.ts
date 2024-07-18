import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  //Use Sockt.io from frontend to connect as the url will be same as for other REST ENDPONITs (http://localhost:3000)
  //If you'll use WebSocket then the url will be change and will include ws://ip:port, I don't really know that formate you have to checke it.
  constructor(private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  private readonly _server: Server;

  afterInit(server: Server) {
    console.log('Websocket Messages Server Initialised!');
    // console.log('Websocket Server : ' ,server);
  }
  handleConnection(client: any, ...args: any[]) {
    console.log('Connected socket : ', client.id);
    // console.log('Connected Client : ', client);
  }
  handleDisconnect(client: any) {
    console.log('Disconnected socket : ', client.id);
    // console.log('Disconnected Client : ', client);
  }

  @SubscribeMessage('sendMessage') // This is an Emitter Event same like GET or POST in REST API
  create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    console.log('Sender socket : ', socket.id);

    // return this.messagesService.create(createMessageDto); // Save the message to db or any other business logic
    //After that

    let recieverSocket: string = createMessageDto.receiverSocket; // Usually user socket is saved in a collection with user reference and message. Mostly this operation is performed in the handleConnection() method,where you check either the socket is available or needs to be saved in the database.

    let messageBody = createMessageDto.message;

    // This is called a Listener Event
    let isMessageSentToReceiver: boolean = this._server
      .to(recieverSocket)
      .emit('message-received-event', messageBody);

    return isMessageSentToReceiver; // or whatever
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messagesService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messagesService.remove(id);
  }
}
