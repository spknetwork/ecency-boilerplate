import { History } from "history";
import React, { useEffect, useRef, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { getMarketBucketSizes, getMarketHistory, MarketCandlestickDataItem } from "../../api/hive";
import moment, { Moment } from "moment";
import { IChartApi, ISeriesApi, Time, TimeRange } from "lightweight-charts";
import Dropdown from "../dropdown";
import { useDebounce } from "react-use";

interface Props {
  history: History;
  widgetTypeChanged: (type: Widget) => void;
}

export const TradingViewWidget = ({ history, widgetTypeChanged }: Props) => {
  const chartRef = useRef<any>();
  const [originalData, setOriginalData] = useState<MarketCandlestickDataItem[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Moment>(moment().subtract(8, "hours"));
  const [endDate, setEndDate] = useState<Moment>(moment());
  const [bucketSeconds, setBucketSeconds] = useState(300);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [chartSeries, setChartSeries] = useState<ISeriesApi<any> | null>(null);
  const [bucketSecondsList, setBucketSecondsList] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const [lastTimeRange, setLastTimeRange] = useState<TimeRange | null>(null);

  useDebounce(
    () => {
      if (!triggerFetch) return;

      setEndDate(startDate.clone().subtract(bucketSeconds, "seconds"));
      setStartDate(
        getNewStartDate(startDate.clone().subtract(bucketSeconds, "seconds"), "subtract")
      );
      fetchData(true);
      setTriggerFetch(false);
    },
    300,
    [triggerFetch]
  );

  useEffect(() => {
    getMarketBucketSizes().then((sizes) => setBucketSecondsList(sizes));
    buildChart().then(() => fetchData());
  }, []);

  useEffect(() => {
    const fromDate = lastTimeRange ? new Date(Number(lastTimeRange.from) * 1000) : null;
    if (fromDate) {
      if (lastTimeRange?.from === data[0].time) setTriggerFetch(true);
    }
  }, [lastTimeRange]);

  useEffect(() => {
    setData([]);
    setEndDate(moment());
    setStartDate(getNewStartDate(moment(), "subtract"));
    setTriggerFetch(true);
  }, [bucketSeconds]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const candleStickSeries = chartSeries ?? chart.addCandlestickSeries();
    candleStickSeries.setData(data);

    if (!isZoomed && data.length > 0) {
      chart?.timeScale().fitContent();
      setIsZoomed(true);
    }

    setChartSeries(candleStickSeries);
  }, [data, chart]);

  const fetchData = async (loadMore?: boolean) => {
    setIsLoading(true);
    const apiData = await getMarketHistory(bucketSeconds, startDate, endDate);
    let transformedData: MarketCandlestickDataItem[] = [];

    if (loadMore) {
      transformedData = [...originalData, ...apiData];
    } else {
      transformedData = apiData;
    }
    setOriginalData(transformedData);

    const dataMap = transformedData
      .map(({ hive, non_hive, open }) => ({
        close: non_hive.close / hive.close,
        open: non_hive.open / hive.open,
        low: non_hive.low / hive.low,
        high: non_hive.high / hive.high,
        volume: hive.volume,
        time: Math.floor(moment(open).toDate().getTime() / 1000) as Time
      }))
      .reduce((acc, item) => acc.set(item.time, item), new Map<Time, any>());
    setData(Array.from(dataMap.values()).sort((a, b) => Number(a.time) - Number(b.time)));

    setIsLoading(false);
  };

  const buildChart = async () => {
    const tradingView = await import("lightweight-charts");
    const chartInstance = tradingView.createChart(chartRef.current, {
      timeScale: {
        timeVisible: true
      },
      height: 400
    });

    chartInstance
      .timeScale()
      .subscribeVisibleTimeRangeChange((timeRange) => setLastTimeRange(timeRange));
    setChart(chartInstance);
  };

  const getNewStartDate = (date: Moment, operation: "add" | "subtract") => {
    let newStartDate = date.clone();
    let value = 0;
    let unit: "hours" | "days" = "hours";
    if (bucketSeconds === 15) value = 4;
    if (bucketSeconds === 60) value = 8;
    if (bucketSeconds === 300) value = 8;
    if (bucketSeconds === 3600) {
      value = 1;
      unit = "days";
    }
    if (bucketSeconds === 86400) {
      value = 20;
      unit = "days";
    }

    if (operation === "add") newStartDate = newStartDate.add(value, unit);
    if (operation === "subtract") newStartDate = newStartDate.subtract(value, unit);

    return newStartDate;
  };

  const getBucketSecondsLabel = () => {
    switch (bucketSeconds) {
      case 15:
        return "15s";
      case 60:
        return "1m";
      case 300:
        return "5m";
      case 3600:
        return "1h";
      case 86400:
        return "1d";
      default:
        return "";
    }
  };

  return (
    <MarketAdvancedModeWidget
      history={history}
      type={Widget.TradingView}
      title={
        <>
          <b>{_t("market.advanced.chart")}</b>
          <small className="pl-1">({getBucketSecondsLabel()})</small>
        </>
      }
      children={<div className="market-advanced-mode-trading-view-widget" ref={chartRef} />}
      widgetTypeChanged={widgetTypeChanged}
      settingsClassName="d-flex"
      additionalSettings={
        <>
          <Dropdown
            float="none"
            label="Bucket size"
            history={history}
            items={bucketSecondsList.map((size) => ({
              label: `${size}`,
              selected: bucketSeconds === size,
              onClick: () => setBucketSeconds(size)
            }))}
          />
        </>
      }
    />
  );
};
