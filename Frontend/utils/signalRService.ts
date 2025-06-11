import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
    private connection: HubConnection | null = null;
    private static instance: SignalRService;

    private constructor() {}

    public static getInstance(): SignalRService {
        if (!SignalRService.instance) {
            SignalRService.instance = new SignalRService();
        }
        return SignalRService.instance;
    }

    public async startConnection(): Promise<void> {
        try {
            this.connection = new HubConnectionBuilder()
                .withUrl('http://localhost:7000/chatHub')
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect()
                .build();

            await this.connection.start();
            console.log('SignalR Connected!');
        } catch (err) {
            console.log('SignalR Connection Error: ', err);
        }
    }

    public async stopConnection(): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.stop();
                console.log('SignalR Disconnected!');
            }
        } catch (err) {
            console.log('SignalR Disconnection Error: ', err);
        }
    }

    public async sendMessage(user: string, message: string): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.invoke('SendMessage', user, message);
            }
        } catch (err) {
            console.log('Error sending message: ', err);
        }
    }

    public async joinGroup(groupName: string): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.invoke('JoinGroup', groupName);
            }
        } catch (err) {
            console.log('Error joining group: ', err);
        }
    }

    public async leaveGroup(groupName: string): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.invoke('LeaveGroup', groupName);
            }
        } catch (err) {
            console.log('Error leaving group: ', err);
        }
    }

    public async sendMessageToGroup(groupName: string, user: string, message: string): Promise<void> {
        try {
            if (this.connection) {
                await this.connection.invoke('SendMessageToGroup', groupName, user, message);
            }
        } catch (err) {
            console.log('Error sending message to group: ', err);
        }
    }

    public onReceiveMessage(callback: (user: string, message: string) => void): void {
        if (this.connection) {
            this.connection.on('ReceiveMessage', callback);
        }
    }

    public isConnected(): boolean {
        return this.connection?.state === 'Connected';
    }
}

export default SignalRService; 