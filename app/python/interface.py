# 从websocket数据包中 获取websocket消息头
import base64
import hashlib
import queue
import socket
import time

import select


def get_headers(data):
    header_dict = {}
    data = str(data, encoding='utf-8')

    header, body = data.split('\r\n\r\n', 1)
    header_list = header.split('\r\n')

    for i in range(len(header_list)):
        if i == 0:
            if len(header_list[i].split(' ')) == 3:
                header_dict['method'], header_dict['url'], header_dict['protocol'] = header_list[i].split(' ')
        else:
            k, v = header_list[i].split(':', 1)
            header_dict[k] = v.strip()

    print(header_dict)
    return header_dict


# 从websocket 获取数据体
# conn是python socket对象 要接收数据的客户端文件描述符
def recv_msg(conn):
    info = conn.recv[8096]
    payload_len = info[1] & 127
    if payload_len == 126:
        extend_payload_len = info[2:4]
        mask = info[4:8]
        decoded = info[8:]
    elif payload_len == 127:
        extend_payload_len = info[2:10]
        mask = info[10:14]
        decoded = info[14:]
    else:
        extend_payload_len = None
        mask = info[2:6]
        decoded = info[6:]

    bytes_list = bytearray()
    for i in range(len(decoded)):
        chunk = decoded[i] ^ mask[i % 4]
        bytes_list.append(chunk)

    body = str(bytes_list, encoding='utf-8')
    return body


# 向websocket 写入
# conn是python socket对象 要写入数据的客户端文件描述符
def send_msg(conn, msg):
    msg_bytes = bytes(msg, encoding='utf-8')
    token = b"\x81"
    length = len(msg_bytes)

    import struct
    if length < 126:
        token += struct.pack("B", length)
    elif length <= 0xFFFF:
        token += struct.pack("!BH", 126, length)
    else:
        token += struct.pack("!BQ", 127, length)

    msg = token + msg_bytes
    conn.send(msg)
    return True


message_queues = {}
client_socket_fd_map = {}


def start_socket_select_server():
    global writeable
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', 8002))
    sock.listen(5)

    print("WebSocket 服务器启动成功 监听IP", ('127.0.0.1', 8002))
    sock.setblocking(False)

    inputs = [sock, ]
    outputs = []

    while True:
        readable, writeable, exceptional = select.select(inputs, outputs, inputs)
        # print('select finish, inputs size:%d, outputs size:%d' % (len(inputs), len(outputs)))

        for s in readable:
            if s is sock:  # 1首先执行这个地方
                # 1往下面走
                conn, client_addr = s.accept()
                print("new connection from", client_addr)
                conn.setblocking(False)
                inputs.append(conn)

                message_queues[conn] = queue.Queue()
            else:  # 2执行这个地方
                if s not in outputs:
                    # 2执行下面
                    # 第一次 表示 websocket的握手
                    data = s.recv(1024)
                    if data:
                        print('received [%s] from %s' % (data, s.getpeername()[0]))
                        # message_queues[s].put(data)

                        headers = get_headers(data)
                        response_tpl = "HTTP/1.1 101 Switching Protocols\r\n" \
                                       "Upgrade: websocket\r\n" \
                                       "Connection: Upgrade\r\n" \
                                       "Sec-WebSocket-Accept: %s\r\n" \
                                       "WebSocket-Location: ws://%s%s\r\n\r\n"

                        sha1 = hashlib.sha1()
                        magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
                        value = headers['Sec-WebSocket-Key'] + magic_string
                        sha1.update(value.encode('utf-8'))
                        ac = base64.b64encode(sha1.digest())
                        response_str = response_tpl % (
                            ac.decode('utf-8'), headers['Host'], headers['url'])
                        s.send(bytes(response_str, encoding='utf-8'))
                        # 这里将文件描述符返回给浏览器 浏览器可以在接下来的http请求中带上这个参数 服务端就可以向这个文件描述符中写入信息返回给指定浏览器
                        # fileno_dict_str = '{"type":1, "body":%s}' % s.fileno()
                        fileno_dict_str = 'really'
                        # message_queues[s].put(fileno_dict_str)

                        if s not in outputs:
                            outputs.append(s)
                            client_socket_fd_map[s.fileno()] = s
                        else:
                            # 表示客户端已经断开
                            print("~~~~~~~~~~~client [%s] closed" % s)
                            if s in outputs:
                                outputs.remove(s)

                            del message_queues[s]
                            del client_socket_fd_map[s.fileno()]
                            inputs.remove(s)
                            s.close()
                    else:
                        # websocket 通信
                        data = s.recv(8096)
                        if data:
                            pass
                        else:
                            # 表示客户端已经断开
                            print("-------------client [%s] closed" % s)
                            if s in outputs:
                                outputs.remove(s)

                            del message_queues[s]
                            del client_socket_fd_map[s.fileno()]
                            inputs.remove(s)
                            s.close()

        # print(len(writeable))

        # for s in writeable:
        #     # msg = input()
        #     # message_queues[s].put(msg)
        #     try:
        #         next_msg = message_queues[s].get_nowait()
        #     except queue.Empty:
        #         pass
        #         # message_queues[s].put('222')
        #     else:
        #         send_msg(s, next_msg)

        if len(writeable) > 0:
            print('连接阶段完成')
            # print('s:',writeable[-1])
            break
            # s = writeable[-1]
            # msg = input()
            # if msg == '1':
            #     set_TemAndHum(s, '15', '18')
            # elif msg == 'finish':
            #     set_finish(s, '12345687',
            #                '[{"type":"recycle","accuracy":"60"},{"type":"harmful","accuracy":"20"},{"type":"other","accuracy":"10"},{"type":"kitchen","accuracy":"3"}]')
            # elif msg == 'back':
            #     set_back(s)

            # msg = input()

            # send_msg(s, msg)

            # try:
            #     next_msg = message_queues[s].get_nowait()
            # except queue.Empty:
            #     pass
            #     message_queues[s].put('222')
            # else:
            #     send_msg(s, next_msg)

        time.sleep(1)


def set_TemAndHum(tem, hum):
    msg = '{"name":"TemAndHum","data":{"tem":"' + tem + '","hum":"' + hum + '"}}'
    send_msg(writeable[-1], msg)


def set_finish(uid, type1,score1,type2,score2,type3,score3,type4,score4):
    lists = '[{"type":"' + type1 + '","accuracy":"' + score1 + '"},{"type":"'+ type2 +'","accuracy":"'+score2+'"},{"type":"'+type3+'","accuracy":"'+score3+'"},{"type":"'+type4+'","accuracy":"'+score4+'"}]'
    msg = '{"name":"finish","uid":' + uid + ',"data":' + lists + '}'
    send_msg(writeable[-1], msg)


def set_back():
    msg = '{"name":"back","data":""}'
    send_msg(writeable[-1], msg)


# 1代表满
def set_status(recycle, harmful, kitchen, other):
    msg = '{"name":"status","data":{"recycle":"' + recycle + '","harmful":"' + harmful + '","kitchen":"' + kitchen + '","other":"' + other + '"}}'
    print(msg)
    send_msg(writeable[-1], msg)

# start_socket_select_server()
