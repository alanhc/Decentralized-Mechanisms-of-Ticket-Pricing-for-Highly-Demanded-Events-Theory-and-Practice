import time
import plotly.express as px
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from utils import *
from data import *
from strategy import *
import sqlite3

program_start = time.time()

#  mu    sigma n p set_price tickets
mu = 1500
sigma = 150
# set_price = [p for p in [50,1000, 1500]]
set_price = [50]
n=10000
p = [p for p in [90,70,50]]
# p=[90]
t = [n//10, n//4, n//2, n*3//4, n*9//10, n]
# t=[n//10]

tests=[]
for ss in set_price:
    for pp in p:
        for tt in t:
            tests.append([mu, sigma, n, pp, ss, tt])



test_ratio = [2, 3, 4, 5, 6, 7, 8, 9]
tickets = 1000
for t in test_ratio:
    # data_distribution mean std     n     p  set_price tickets
    tests = [["log_normal", 700, 740.56337, int(t*tickets), 70, 49, tickets]]

    
    def save(ans, price_history, logs, money):
        bin_width = 10 #len(money)//50
        fig = hist(money, bin_width, f"Histogram ({ans[0][0]}-{ans[0][3]}-{ans[0][6]})", "Price(Ticket price USD)", "Ticket Amount")
        fig.write_html(f"log/money/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.html")
        fig.write_image(f"log/img/hist_{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.png")
        fig = demand_curve(money, bin_width, f"Demand ({ans[0][0]}-{ans[0][3]}-{ans[0][6]})")
        fig.write_html(f"log/demand/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.html")
        fig.write_image(f"log/img/demand_{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.png")

        pd.options.display.float_format = '{:.3f}'.format
        df = pd.DataFrame(ans, columns=[
                        "data_distribution", "mu", "sigma", "n", "percentage_buyers", "set_price", "tickets",
                        "trad_scalper_total", "trad_scalper_min", "trad_scalper_max", "trad_scalper_med", "trad_scalper_mean", "trad_scalper_std", "trad_set_price", "trad_organizer_payoff", "trad_buyers_total", "trad_buyers_min", "trad_buyers_max", "trad_buyers_median", "trad_buyers_mean", "trad_buyers_std",
                        "purple_total", "purple_min", "purple_max", "purple_med", "purple_mean", "purple_std", "purple_end_price", "pur_organizer_payoff", "pur_buyers_total", "pur_buyers_min", "pur_buyers_max", "pur_buyers_median", "pur_buyers_mean", "pur_buyers_std",
                        "dy_total", "dy_min", "dy_max", "dy_organizer_payoff", "dy_buyers_total", "dy_buyers_min", "dy_buyers_max", "dy_buyers_median", "dy_buyers_mean", "dy_buyers_std",])
        def increase_ratio(a, b):
            if a==0:
                a = 0.0000001
            return (b - a)/a

        df["organizer increase ratio (traditional)"] = df.apply(lambda x: increase_ratio(x['trad_organizer_payoff'], x['pur_organizer_payoff']), axis=1)
        df["scalpers increase ratio (traditional)"] = df.apply(lambda x: increase_ratio(x['trad_scalper_total'], x['purple_total']), axis=1)
        df["buyers increase ratio (traditional)"] = df.apply(lambda x: increase_ratio(x['trad_buyers_total'], x['pur_buyers_total']), axis=1)
        df["buyers std increase ratio (traditional)"] = df.apply(lambda x: increase_ratio(x['trad_buyers_std'], x['pur_buyers_std']), axis=1)

        df["organizer increase ratio (dynamic)"] = df.apply(lambda x: increase_ratio(x['dy_organizer_payoff'], x['pur_organizer_payoff']), axis=1)
        df["scalpers increase ratio (dynamic)"] = df.apply(lambda x: increase_ratio(x['dy_total'], x['purple_total']), axis=1)
        df["buyers increase ratio (dynamic)"] = df.apply(lambda x: increase_ratio(x['dy_buyers_total'], x['pur_buyers_total']), axis=1)
        df["buyers std increase ratio (dynamic)"] = df.apply(lambda x: increase_ratio(x['dy_buyers_std'], x['pur_buyers_std']), axis=1)
        
        df.to_csv(f"log/raw/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")

        organizer_report = df[["data_distribution","organizer increase ratio (traditional)", "organizer increase ratio (dynamic)"]]
        organizer_report.to_csv(f"report/organizer/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        scalper_report = df[["data_distribution","scalpers increase ratio (traditional)", "scalpers increase ratio (dynamic)"]]
        scalper_report.to_csv(f"report/scalper/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        buyer_report = df[["data_distribution","buyers increase ratio (traditional)", "buyers increase ratio (dynamic)"]]
        buyer_report.to_csv(f"report/buyer/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        buyer_report_std = df[["data_distribution","buyers std increase ratio (traditional)", "buyers std increase ratio (dynamic)"]]
        buyer_report_std.to_csv(f"report/buyer_std/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        
        df_price = pd.DataFrame(price_history, columns=["i","price", "strategy", "from", "to"])
        df_price.to_csv(f"log/price_history/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        
        fig = px.line(df_price, x="i", y="price", title=f"price history ({ans[0][0]}-{ans[0][3]}-{ans[0][6]})", color="strategy")
        fig.update_xaxes(title='ith transaction')
        fig.update_yaxes(title='Price(Ticket price USD)')
        fig.write_html(f"log/price_history/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.html")
        fig.write_image(f"log/img/price_history_{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.png")

        df_log = pd.DataFrame(logs, columns=["i","buyer","amount","tickets", "strategy"])
        df_log.to_csv(f"log/log_history/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.csv")
        
        fig = px.line(df_log, x="i", y="tickets", title=f"orgnaizer sales history ({ans[0][0]}-{ans[0][3]}-{ans[0][6]})", color="strategy")
        fig.write_html(f"log/log_history/{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.html")
        fig.write_image(f"log/img/organizer_sales_{ans[0][0]}-{ans[0][3]}-{ans[0][6]}.png")
    def caculate_buyer(money_back, money, buyers, amount):
        b = (money_back-money) * np.array(buyers, dtype=bool)
        b = b[np.nonzero(amount)]
        buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std  = sum(b), np.min(b) , np.max(b), np.median(b), np.mean(b), np.std(b)
        return buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std
    def caculate_scalper(money_back, money, buyers, amount):
        b = (money_back-money) * np.logical_not(np.array(buyers, dtype=bool))
        b = b[np.nonzero(amount)]
        buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std  = sum(b), np.min(b) , np.max(b), np.median(b), np.mean(b), np.std(b)
        return buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std
    
    ans = [[]] * len(tests)
    history = []
    trad_res_money, purple_res_money, dy_res_money = None, None, None
    buyers = None
    t_log = []
    test_t = 10

    for i in range(len(tests)):
        logs = []
        price_history = []
        ans[i] = []
        ans[i] += tests[i]
        data_distrubution, mu, sigma, n, percentage_buyers, set_price, tickets = tests[i]

        money, buyers = gen_data_log_normal(mu, sigma, n, 70)
        money_back, tickets_back, set_price_back = money.copy(), tickets, set_price
        
        # traditional
        start = time.time()
        amount, organizer_payoff,logs, price_history, history, money = traditional_primary_market(buyers, money, set_price, n, tickets, logs, price_history, history)
        t_log.append([time.time()-start,"trad_1"])
        start = time.time()
        money,amount,price_history, history = traditional_secondary_market(buyers, money, amount, set_price, n, price_history, history)
        t_log.append([time.time()-start, "trad_2"])
        scalpers_payoff = np.subtract(np.multiply(money, np.logical_not(buyers)), np.multiply(money_back.copy(), np.logical_not(buyers)))
        trad_res_money = money

        buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std = caculate_buyer(money_back.copy(), money, buyers, amount)
        
        ans[i] += [sum(scalpers_payoff), min(scalpers_payoff), max(scalpers_payoff), np.median(scalpers_payoff), np.mean(scalpers_payoff), np.std(scalpers_payoff),  set_price, organizer_payoff, buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std]
        
        money, buyers = gen_data_log_normal(mu, sigma, n, 95)
        money_back, tickets_back, set_price_back = money.copy(), tickets, set_price
        # purple simulation
        start = time.time()
        money, now_price, organizer_payoff, amount, logs,price_history, history = dutch_auction_with_refund(money_back.copy(), buyers, set_price_back, tickets_back, n,logs,price_history, history)
        t_log.append([time.time()-start, "dutch"])
        purple_res_money = money
        scalpers_payoff = np.subtract(np.multiply(money, np.logical_not(buyers)), np.multiply(money_back.copy(), np.logical_not(buyers)))
        buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std = caculate_buyer(money_back.copy(), money, buyers, amount)
        ans[i] += [sum(scalpers_payoff), min(scalpers_payoff), max(scalpers_payoff), np.median(scalpers_payoff), np.mean(scalpers_payoff), np.std(scalpers_payoff), now_price, organizer_payoff,buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std]
        
        # dynamic pricing silulation 
        partition_rate = 0.01
        increase_rate = 0.5
        name = f"i:{increase_rate},p:{partition_rate}"
        name = "dynamic"
        start = time.time()
        amount, money, organizer_payoff, logs, price_history, history = dynamic_pricing_simulation_2_rate(money_back.copy(), buyers.copy(), set_price, tickets_back, n, partition_rate, logs, price_history, increase_rate, history, name)
        t_log.append([time.time()-start, "dynamic"])
        dy_res_money = money
        scalpers_payoff = np.subtract(np.multiply(money, np.logical_not(buyers)), np.multiply(money_back.copy(), np.logical_not(buyers)))
        buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std = caculate_buyer(money_back.copy(), money, buyers, amount)
        ans[i] += [sum(scalpers_payoff), min(scalpers_payoff), max(scalpers_payoff), organizer_payoff, buyers_payoff, buyers_min, buyers_max, buyers_median, buyers_mean, buyers_std]

    cols=["distibution", "mean", "std","n","p","set_price","tickets", "traditional_sum", "traditional_min", "traditional_max", "traditional_med", "traditional_mean", "traditional_std", "traditional_set_price", "traditional_organizer_payoff", "traditional_buyers_total", "traditional_buyers_min", "traditional_buyers_max", "traditional_buyers_median", "traditional_buyers_mean", "traditional_buyers_std", "purple_sum", "purple_min", "purple_max", "purple_med", "purple_mean", "purple_std", "purple_end_price", "purple_organizer_payoff", "purple_buyers_total", "purple_buyers_min", "purple_buyers_max", "purple_buyers_median", "purple_buyers_mean", "purple_buyers_std", "dynamic_sum", "dynamic_min", "dynamic_max", "dynamic_organizer_payoff", "dynamic_buyers_total", "dynamic_buyers_min", "dynamic_buyers_max", "dynamic_buyers_median", "dynamic_buyers_mean", "dynamic_buyers_std"]
    total = pd.DataFrame(ans, columns=cols)
    _ = [[0]*len(cols)]
    df = pd.DataFrame(_, columns=cols)
    for col in df:
        if type(total[col][0]) == np.int64 or type(total[col][0]) == np.float64:
            df[col] = total[col].mean()
        else:
            df[col] = total[col][0]

    save(df.values.tolist(), price_history, logs, money_back.copy())
    print("simulation end.")
    print(f"total time: {time.time()-program_start}")

    
    con = sqlite3.connect("result.db")
    cur = con.cursor()
    cur.execute("drop table if exists transaction_history")
    cur.execute("create table transaction_history(money float, si int, di int, src text, dst text, strategy text)")
    cur.executemany("INSERT INTO transaction_history VALUES(?, ?, ?, ?, ?, ?)", history)
    con.commit()  # Remember to commit the transaction after executing INSERT.

    strategies = ["traditional", "dynamic", "dutch_auction_with_refund"]
    scaplers_report=[[]] * len(strategies)
    buyers_report=[[]] * len(strategies)
    total_report = [[]] * len(strategies)
    total_df = pd.DataFrame()
    i=0
    for strategy in strategies:
        print(strategy)
        s_payoff, b_payoff, o_payoff = 0, 0, 0
        for stakeholder in ["scalper", "organizer", "buyer"]:
            print(" ",stakeholder, i)
            profit = cur.execute(f"SELECT match, sum(m) FROM ( SELECT di as match, money as m FROM transaction_history WHERE dst = '{stakeholder}' AND strategy = '{strategy}' UNION ALL SELECT si as match,  -money as m FROM transaction_history WHERE src = '{stakeholder}' AND strategy = '{strategy}' ) GROUP BY match ORDER BY match ASC")
            total_profit = profit.fetchall()
            df = pd.DataFrame(total_profit, columns=["match", "profit"])
            df["strategy"] = strategy
            df["stakeholder"] = stakeholder
            total_df = pd.concat([total_df, df])
            payoff = df["profit"].to_numpy()
            if stakeholder == "scalper":
                s_payoff = payoff
                r_s = [strategy,np.sum(s_payoff), np.min(s_payoff), np.max(s_payoff), np.mean(s_payoff), np.std(s_payoff), np.percentile(s_payoff, 25),  np.median(s_payoff), np.percentile(s_payoff, 75)]
                scaplers_report[i] = r_s
            elif stakeholder == "buyer":
                b_payoff = payoff
                b_s = [strategy, np.sum(b_payoff), np.min(b_payoff),np.max(b_payoff), np.mean(b_payoff), np.std(b_payoff), np.percentile(b_payoff, 25),  np.median(b_payoff), np.percentile(b_payoff, 75)]
                buyers_report[i]=b_s
            elif stakeholder == "organizer":
                o_payoff = payoff
        total_report[i] = [np.sum(o_payoff), np.sum(s_payoff), np.sum(b_payoff), np.std(b_payoff)]
        i+=1
    pd.DataFrame(scaplers_report, columns=["strategy","total", "min", "max", "mean", "std", "p_25", "median", "p_75"]).T.to_csv(f"report/scalper_income-{tests[0][3]}-{tests[0][6]}.csv")
    pd.DataFrame(buyers_report, columns=["strategy","total", "min", "max", "mean", "std", "p_25", "median", "p_75"]).T.to_csv(f"report/buyer_income-{tests[0][3]}-{tests[0][6]}.csv")
    pd.DataFrame(total_report, columns=["organizer", "scalper", "buyer", "buyer_std"]).to_csv(f"report/total-{tests[0][3]}-{tests[0][6]}.csv")

    
    for stakeholder in ["buyer", "scalper"]:
        data = total_df[total_df["stakeholder"] == stakeholder]
        fig = px.histogram(data, x="profit", color="strategy", barmode="overlay")
        fig.update_layout(
            title=f"{stakeholder} payoff distribution",
            xaxis_title='Payoff(USD)',
            yaxis_title='Count'
        )
        fig.write_html(f"log/hist_{stakeholder}-{tests[0][3]}-{tests[0][6]}.html")
        fig.write_image(f"log/img/hist_{stakeholder}-{tests[0][3]}-{tests[0][6]}.png")
        
        fig = px.box(data, x="strategy", y="profit")
        fig.update_layout(
            title=f"{stakeholder} boxplot",
            xaxis_title='Strategy',
            yaxis_title='Payoff(USD)'
        )
        fig.write_html(f"log/boxplot_{stakeholder}-{tests[0][3]}-{tests[0][6]}.html")
        fig.write_image(f"log/img/boxplot_{stakeholder}-{tests[0][3]}-{tests[0][6]}.png")

data = []
for r in test_ratio:
    data.append((int(r*tickets), tickets))
total = pd.DataFrame()
for n,t in data:
    df = pd.read_csv(f"report/total-{n}-{t}.csv")
    df["n"] = n
    df["t"] = t
    total = pd.concat([total, df])
    total["strategy"] = total["Unnamed: 0"]
    total["strategy"] = total["strategy"].replace({0:"traditional", 1:"dynamic", 2:"dutch_auction_with_refund"})

for s in ["organizer", "scalper", "buyer", "buyer_std"]:
    # fig = px.line(total, x="n", y=s,
    #             color='strategy', markers=True
    #             )
    fig = px.histogram(total, x="n", y=s,
                color='strategy', barmode='group', text_auto='.2s'
                )
    fig.update_xaxes(type='category')
    fig.update_layout(
        title=f"{s}s payoff",
        xaxis_title='n',
        yaxis_title='Payoff(USD)'
    )
    fig.write_html(f"log/{s}-payoff.html")
    fig.write_image(f"log/img/payoff-{s}.png")
    #fig.update_traces(textfont_size=12, textangle=0, textposition="outside", cliponaxis=False)
    fig.show()
