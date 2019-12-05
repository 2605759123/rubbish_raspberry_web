import interface_2

interface_2.start_socket_select_server()
while True:
    msg = input()
    if msg == '1':
        interface_2.set_TemAndHum('5','8')

    # if msg == 'finish':
    #     interface_2.set_finish('12345687',
    #                '[{"type":"recycle","accuracy":"60"},{"type":"harmful","accuracy":"20"},{"type":"other","accuracy":"10"},{"type":"kitchen","accuracy":"3"}]')

    if msg == 'back':
        interface_2.set_back()

    if msg == 'status':
        interface_2.set_status('1','1','1','1')






