package tsdb

func HandleRequest(req *Request) (*Response, error) {
	context := NewQueryContext(req.Queries, req.TimeRange)

	batches, err := getBatches(req)
	if err != nil {
		return nil, err
	}

	currentlyExecuting := 0

	for _, batch := range batches {
		if len(batch.Depends) == 0 {
			currentlyExecuting += 1
			batch.Started = true
			go batch.process(context)
		}
	}

	response := &Response{}

	for currentlyExecuting != 0 {
		select {
		case batchResult := <-context.ResultsChan:
			currentlyExecuting -= 1

			response.BatchTimings = append(response.BatchTimings, batchResult.Timings)

			if batchResult.Error != nil {
				return nil, batchResult.Error
			}

			for refId, result := range batchResult.QueryResults {
				context.Results[refId] = result
			}

			for _, batch := range batches {
				// not interested in started batches
				if batch.Started {
					continue
				}

				if batch.allDependenciesAreIn(context) {
					currentlyExecuting += 1
					batch.Started = true
					go batch.process(context)
				}
			}
		}
	}

	response.Results = context.Results
	return response, nil
}
