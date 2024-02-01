import numpy as np
def traditional_primary_market(buyers, money, set_price_, n, tickets, logs_, price_history, history):
    print("traditional_primary_market")
    amount = [0]*n
    logs = logs_
    set_price = set_price_
    organizer_payoff=0
    logs.append([-1, 0, 0, tickets, "traditional_primary_market"])
    buyer_text = {1:'buyer', 0:'scalper'}
    price_history_idx = len(price_history)
    for i in range(n):
        if (buyers[i]==0 and money[i]>=set_price and tickets>0): # scalper buy
            #amount[i] = min(money[i]//set_price, tickets)
            amount[i] = 1
        elif(buyers[i]==1 and money[i]>=set_price and tickets>0):  # buyer buy
            amount[i] = 1
        if (amount[i]>0):
            pay = amount[i] * set_price
            money[i] -= pay
            tickets -= amount[i]
            organizer_payoff+= pay
            logs.append([i, buyers[i], amount[i], tickets, "traditional_primary_market"])
            price_history.append([price_history_idx, set_price, "traditional", buyer_text[buyers[i]], "organizer"])
            price_history_idx+=1
            history.append([pay, i, -1, buyer_text[buyers[i]], "organizer", "traditional"])
            #history.append([-pay, -1, i, "organizer", buyer_text[buyers[i]], "traditional"])
            
    print("amount:", sum(amount))
    return  amount, organizer_payoff, logs, price_history, history, money
def traditional_secondary_market(buyers, money, amount, set_price, n, price_history, history):
    print("traditional_secondary_market")
    price_history_idx = len(price_history)
    buyer_text = {1:'buyer', 0:'scalper'}
    scalpers_t=1
    while (True):
        scalpers_t = sum(np.multiply(np.logical_not(buyers), amount)) # tickets scalpers have
        print("scalpers_t", scalpers_t, end="\r")
        if scalpers_t==0:
            break
        ticket_scalper_per_t = max(np.multiply(np.multiply(np.logical_not(amount), buyers),money)) # max ticket price scalper can sell
        if ticket_scalper_per_t<=0: # no buyer can buy
            print("no buyer can buy")
            break
        # scalpers refund for reducing losing money
        if (ticket_scalper_per_t < set_price*0.9):
            print("scalpers refund")
            for i in range(n):
                if buyers[i]==0 and amount[i]>0:
                    refund = amount[i] * (set_price * 0.9)
                    money[i] += refund # refund
                    history.append([refund, -1, i, "organizer", "scalper", "traditional_2"])
                    #history.append([-refund, i, -1, buyer_text[buyers[i]], "organizer", "traditional"])
                    
                    amount[i] = 0 
            break
        for i in range(n):
            if (buyers[i]==1 and ticket_scalper_per_t<=money[i] and amount[i]==0):
                # buy tickets from scalpers j
                for j in range(n):
                    if amount[j]>0 and buyers[j]==0: # scalper have tickets
                        # buy_t = 1 # min(amount[j], demand[i]) # tickets can buy from scalpers
                        # scalper -> buyer
                        # print(f"scalper -({ticket_scalper_per_t})> buyer")
                        amount[j] -= 1
                        amount[i] += 1
                        money[j] += ticket_scalper_per_t 
                        money[i] -= ticket_scalper_per_t 
                        price_history.append([price_history_idx, ticket_scalper_per_t, "traditional", "buyer", "scalper"])
                        price_history_idx+=1
                        history.append([ticket_scalper_per_t, i, j, "buyer", "scalper", "traditional"])
                        #history.append([ticket_scalper_per_t, j, i, "scalper", "buyer", "traditional"])
                        
                        break
    return money, amount, price_history, history
def dutch_auction_with_refund(money, buyers, set_price_back_, tickets_back, n, logs_, price_history, history):
    print("dutch_auction_with_refund")
    price_history_idx=0
    logs = logs_
    set_price_back = set_price_back_
    set_price = max(max(money), set_price_back)
    tickets = tickets_back
    amount = [0]*n
    buy_at = [0]*n
    now_price = set_price
    organizer_payoff=0
    log_idx = -1
    logs.append([log_idx, 0, 0, tickets, "dutch_auction_with_refund"])
    log_idx+=1
    scalper_price = []
    scalper_price_idx = 0
    market_price = []
    market_price_idx = 0
    
    buyer_text = {1:'buyer', 0:'scalper'}

    # start to sell 
    while (True):
        if sum(np.multiply(buyers,amount))==tickets_back: # all buyers have tickets
            break
        # refund
        for i in range(n):
            if (buy_at[i]>0):
                refund = (buy_at[i]-now_price)*amount[i]
                if (refund>0):
                    money[i] += refund
                    buy_at[i] = now_price
                    organizer_payoff-=refund
                    history.append([refund, -1, i, "organizer", buyer_text[buyers[i]], "dutch_auction_with_refund"])
                    
                    
        # start to sell
        if max(max(np.multiply(buyers,money)), max(np.multiply(np.logical_not(buyers),money)))>=now_price:
            for i in range(n):
                if tickets==0:
                    break
                
                # max_buy_t = min(money[i]//now_price, tickets)
                max_buy_t = min(money[i]//now_price, tickets, 1)

                if (buyers[i]==1 and now_price<=money[i] and amount[i]==0 and tickets>0 and max_buy_t>0): #buyer buy from market
                    amount[i] += 1
                    buy_at[i] = now_price
                    money[i] -= now_price
                    tickets -= 1
                    logs.append([log_idx, buyers[i], amount[i], tickets, "dutch_auction_with_refund"])
                    log_idx+=1
                    market_price.append([market_price_idx, now_price, "dutch_auction_with_refund", "buyer", "organizer"])
                    market_price_idx+=1
                    history.append([now_price,  int(i), -1, "buyer", "organizer", "dutch_auction_with_refund"])
                    #history.append([-now_price,  -1, i, "organizer", "buyer", "dutch_auction_with_refund"])
                    
                    # print(i, tickets, buyers[i], money[i], buy_at[i], now_price, amount[i])
                    organizer_payoff += now_price
                elif (buyers[i]==0 and tickets>0 and max_buy_t>0): # scalper buy
                    pay = max_buy_t * now_price
                    amount[i] += max_buy_t
                    buy_at[i] = now_price
                    money[i] -= pay
                    tickets -= max_buy_t
                    logs.append([log_idx, buyers[i], amount[i], tickets, "dutch_auction_with_refund"])
                    log_idx+=1
                    market_price.append([market_price_idx, now_price, "dutch_auction_with_refund", "scalper", "organizer"])
                    market_price_idx+=1
                    # print(i, tickets, buyers[i], need[i], money[i], buy_at[i], now_price, amount[i])
                    history.append([pay, int(i), -1, "scalper", "organizer", "dutch_auction_with_refund"])
                    #history.append([-pay, -1, i, "organizer", "scalper", "dutch_auction_with_refund"])
                    
                    organizer_payoff += max_buy_t * now_price
        # scalpers clear tickets 

        if tickets==0:
            for i in range(n):
                if buyers[i]==0 and amount[i]>0:
                    b = np.multiply(np.multiply(buyers, np.logical_not(amount)), money)
                    buyer_max_index = np.argmax(b)
                    buyer_max = max(b)
                    if buyer_max>=set_price_back*0.9: # scalpers sell to buyer
                        amount[buyer_max_index] += 1
                        amount[i] -= 1
                        money[buyer_max_index] -= buyer_max
                        money[i] += buyer_max
                        scalper_price.append([scalper_price_idx, buyer_max, "dutch_auction_with_refund", "buyer", "scalper"])
                        scalper_price_idx+=1
                        history.append([buyer_max, int(buyer_max_index), i, "buyer", "scalper", "dutch_auction_with_refund"])
                        #history.append([-buyer_max, i, buyer_max_index, "scalper", "buyer", "dutch_auction_with_refund"])
                        
                        # price_history_idx+=1
                        print("scaler clear tickets", i, buyer_max_index, buyer_max, money[i], money[buyer_max_index], amount[i], amount[buyer_max_index])
                        #print(i, tickets, buyers[i], money[i], buy_at[i], now_price, amount[i])
                        buy_at[i] = 0
                    else: # scalpers refund for reducing losing money
                        refund = amount[i] * (set_price_back * 0.9)
                        print("scalpers refund", i,  amount[i], refund, money[i], end="->")
                        history.append([refund, -1, i, "organizer", "scalper", "dutch_auction_with_refund"])
                        #history.append([-refund, i, -1, "scalper", "organizer", "dutch_auction_with_refund"])
                        
                        tickets += amount[i]
                        money[i] += refund # refund
                        amount[i] = 0
                        buy_at[i] = 0
                        organizer_payoff -= refund
                        print(money[i], organizer_payoff)
                        
                        
        print("now price", now_price, tickets, sum(amount), organizer_payoff)
        if now_price<=0:
            print("now_price<=0")
            break
        if tickets>0:
            new_price = max(np.max(np.multiply(np.multiply(buyers, money), np.logical_not(amount))), np.max(np.multiply(np.logical_not(buyers), money))) # speed up simulation
            if now_price<=set_price_back*0.9:
                break
            # if now_price == np.nan:
            #     print("now_price==nan")
            #     break
            

            now_price = new_price
                
            
            # now_price -= 1
            
    print("amount:--------", sum(amount))
    for i in range(market_price_idx):
        price_history.append([i, now_price, "dutch_auction_with_refund", market_price[i][3], market_price[i][4]])
    for i in range(scalper_price_idx):
        price_history.append([i+market_price_idx+1, scalper_price[i][1], "dutch_auction_with_refund", scalper_price[i][3], scalper_price[i][4]])
    print("amount:--------", sum(amount))
    return money, now_price, organizer_payoff, amount, logs, price_history, history

def dynamic_pricing_simulation_2_rate(money, buyers, set_price_back_, tickets_back, n, partition_rate, logs, price_history, increase_rate, history, name):
    print("dynamic_pricing_simulation_2_rate")
    price_history_idx = 0
    partition = tickets_back*partition_rate
    pre_tickets = tickets_back
    now_price = set_price_back_
    #increase_rate = .5
    increase_factor = 1

    buyer_text = {1:'buyer', 0:'scalper'}
    tickets = tickets_back

    organizer_payoff=0
    amount = [0]*n
    log_idx = -1
    logs.append([log_idx, 0, 0, tickets, name])
    log_idx+=1
    while (True):
        print("now_price:", now_price, tickets, sum(amount))
        if sum(np.multiply(buyers, amount))==tickets_back: # all buyers have tickets
            break
        buy = False
        
        # incresing price
        if pre_tickets-tickets >= partition and (now_price*increase_factor)<=max(money):
            increase_factor += increase_rate
            now_price *= increase_factor
            pre_tickets = tickets
            print('nowprice:', now_price, max(money), tickets, "increase:",increase_factor, increase_rate)
        # buy 

        for i in range(n):
            # skip buyer already have ticket
            if tickets==0:
                break
            if buyers[i]==1 and amount[i]>0: 
                continue
            
            # max_buy_t_from_market = min(money[i]//now_price, tickets)
            max_buy_t_from_market = min(tickets,1) #min(money[i]//now_price, tickets, 1)
            
            buy_t = 0
            if buyers[i]==1 and amount[i]==0 and money[i]>=now_price*max_buy_t_from_market and max_buy_t_from_market>0: # buyer can buy
                print("dy buyer buy", i, money[i], now_price, max_buy_t_from_market)
                buy_t = max_buy_t_from_market
            elif buyers[i]==0 and money[i]>=now_price*max_buy_t_from_market and max_buy_t_from_market>0: # scalper can buy
                print("dy scalper buy", i, money[i], now_price, max_buy_t_from_market)
                buy_t = max_buy_t_from_market
            if buy_t>0:
                buy = True
                amount[i] += buy_t
                pay = now_price * buy_t
                money[i] -= pay
                
                organizer_payoff += pay
                tickets -= buy_t
                logs.append([log_idx, buyers[i], amount[i], tickets, name])
                log_idx+=1
                history.append([pay, int(i), -1, buyer_text[buyers[i]], "organizer", name])
                #history.append([-pay , -1, i, "organizer", buyer_text[buyers[i]], name])
                
                price_history.append([price_history_idx, now_price, name, buyer_text[buyers[i]], "organizer"])
                price_history_idx+=1
                if now_price==0:
                    print(now_price, increase_factor, increase_rate, increase_factor*increase_rate)
                    raise Exception("now_price==0")
                
                print(i, buyer_text[buyers[i]], 'buy', amount[i], 'tickets', tickets,'money', money[i], 'price', now_price, amount[i])
                break
            if money[i]<0:
                raise Exception('money<0')
                
        # buy from scalpers
        if tickets==0:
            buyers_not_have_ticket = np.multiply(np.multiply(buyers, money), np.logical_not(amount)) # money that buyers doesn't have ticket have
            highest_buyer_money = max(buyers_not_have_ticket) # money that market have
            highest_buyer_idx = np.argmax(buyers_not_have_ticket) # highest buyer
            print("scalpers_sale", highest_buyer_money, highest_buyer_idx, tickets, sum(amount))
            for j in range(n):
                if buyers[j]==0 and amount[j]>0: # scalper
                    amount[highest_buyer_idx] += 1
                    amount[j] -= 1
                    money[highest_buyer_idx] -= highest_buyer_money 
                    money[j] += highest_buyer_money
                    history.append([highest_buyer_money, int(highest_buyer_idx), j, "buyer", "scalper", name])
                    #history.append([-highest_buyer_money, j, highest_buyer, "scalper", "buyer", name])
                    
                    price_history.append([price_history_idx, highest_buyer_money, name, "buyer", "scalper"])
                    price_history_idx+=1
                    print("scalpers_sale", money[i], money[j], amount[i], amount[j])
                    break
        if not buy:
            increase_factor -= increase_rate
            if increase_factor<=0:
                increase_factor = increase_rate
            now_price *= increase_factor
            now_price = int(now_price)
            if now_price<=0:
                print("now_price<=0", increase_factor, increase_rate, now_price)
                break
    print( sum(amount) )
    return amount, money, organizer_payoff, logs, price_history, history

# def dynamic_pricing_simulation_1(money, buyers, set_price_back_, tickets_back, n, partition_rate, logs, price_history):
#     print("dynamic_pricing_simulation_1")
#     price_history_idx = 0
#     partition = tickets_back*partition_rate
#     pre_tickets = tickets_back
#     now_price = set_price_back_
#     buyer_text = {1:'buyer', 0:'scalper'}
#     tickets = tickets_back
#     scalpers_t=1
#     organizer_payoff=0
#     amount = [0]*n
#     log_idx = -1
#     logs.append([log_idx, 0, 0, tickets, "dynamic_pricing_1"])
#     log_idx+=1
#     while (True):
#         if scalpers_t==0:
#             break
#         buy = False
#         # buy from market 
#         for i in range(n):
#             if tickets==0:
#                 break
#             if pre_tickets-tickets >= partition:
#                 now_price *= 2
#                 pre_tickets = tickets
#                 if now_price > max(money):
#                     now_price /= 2
#                     now_price = int(now_price)
#                     break
#                 print('nowprice:', now_price, max(money), tickets)
#             max_buy_t = min(money[i]//now_price, tickets)
            
#             buy_t = 0
#             if buyers[i]==1 and amount[i]==0 and now_price<=money[i] and max_buy_t>0: # buyer can buy
#                 buy_t = min(1, max_buy_t)

#             elif buyers[i]==0 and money[i]>=now_price*max_buy_t and max_buy_t>0:
#                 buy_t = max_buy_t
#             if buy_t>0:
#                 buy = True
#                 amount[i] += buy_t
#                 money[i] -= now_price * buy_t
#                 organizer_payoff += now_price * buy_t
#                 tickets  -= amount[i]
#                 logs.append([log_idx, buyers[i], amount[i], tickets, "dynamic_pricing_1"])
#                 price_history.append([price_history_idx, now_price, "dynamic_pricing_1", "organizer", buyer_text[buyers[i]]])
#                 price_history_idx+=1
#                 log_idx+=1
#                 print(i, buyer_text[buyers[i]], 'buy', amount[i], 'tickets', tickets,'money', money[i], 'price', now_price, amount[i])
#             if money[i]<0:
#                 raise Exception('money<0')
               
#         # buy from scalpers
#         if tickets==0:
#             scalpers_t = sum(np.multiply(np.logical_not(buyers), amount)) # tickets scalpers have
#             buyers_not_have_ticket = np.multiply(np.multiply(buyers, money), np.logical_not(amount)) # money that buyers doesn't have ticket have
#             highest_buyer_money = max(buyers_not_have_ticket) # money that market have
#             highest_buyer = np.argmax(buyers_not_have_ticket) # highest buyer
#             for j in range(n):
#                 if buyers[j]==0 and amount[j]>0: # scalper
#                     amount[highest_buyer] += 1
#                     amount[j] -= 1
#                     money[highest_buyer] -= highest_buyer_money 
#                     money[j] += highest_buyer_money
#                     price_history.append([price_history_idx, highest_buyer_money, "dynamic_pricing_1", "scalper", "buyer"])
#                     price_history_idx+=1
#                     print("scalpers_t",scalpers_t, money[i], money[j], amount[i], amount[j])
#                     break
#         if not buy:
#             now_price /= 2
#             now_price = int(now_price)
#     print( sum(amount) )
#     return amount, money, organizer_payoff, logs, price_history